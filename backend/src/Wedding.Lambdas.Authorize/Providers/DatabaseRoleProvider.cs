using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Common.Auth;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.JwtClaim;
using Wedding.Common.Multitenancy;

namespace Wedding.Lambdas.Authorize.Providers
{
    public class DatabaseRoleProvider : IAuthorizationProvider
    {
        private ILogger<DatabaseRoleProvider> _logger;
        private readonly IMapper _mapper;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IAuthenticationProvider _authenticationProvider;
        private readonly IMultitenancySettingsProvider _multitenancySettingsProvider;

        public DatabaseRoleProvider(ILogger<DatabaseRoleProvider> logger, IMapper mapper, IDynamoDBProvider dynamoDBProvider, IAuthenticationProvider authenticationProvider, IMultitenancySettingsProvider multitenancySettingsProvider)
        {
            _logger = logger;
            _mapper = mapper;
            _dynamoDBProvider = dynamoDBProvider;
            _authenticationProvider = authenticationProvider;
            _multitenancySettingsProvider = multitenancySettingsProvider;
        }

        // private string GetRequiredPermissionByEndpoint(string methodArn)
        // {
        //     switch (methodArn)
        //     {
        //         case (LambdaArns.AdminFamilyUnitCreate):
        //         case (LambdaArns.AdminFamilyUnitUpdate):
        //         case (LambdaArns.AdminFamilyUnitDelete):
        //             return RoleEnum.Admin.ToString();
        //         default:
        //             return RoleEnum.Guest.ToString();
        //     }
        // }

        private bool IsAuthorizedToViewThisPage(GuestDto authenticatedUser, bool requiresFamilyBelonging, string methodInvitationCode)
        {
            if (authenticatedUser.IsAdmin())
            {
                return true;
            }

            return requiresFamilyBelonging ? authenticatedUser.InvitationCode.ToUpper() == methodInvitationCode.ToUpper() : true;
        }

        /// <summary>
        /// Auth0User has UserId (auth0) and GuestId (lives on AppData obj)
        ///
        /// If coming through auth layer, can be scenarios:
        /// 1. 
        /// 2. Has Auth0Id saved to guest entity
        /// </summary>
        /// <param name="token"></param>
        /// <param name="methodArn"></param>
        /// <returns></returns>
        /// <exception cref="UnauthorizedAccessException"></exception>
        public async Task<GuestDto?> Authorize(ValidateAuthQuery query)
        {
            try
            {
                GuestDto? user = null;
                WeddingEntity? entity = null;

                var audience = query.JwtAudience ?? throw new InvalidOperationException();

                _logger.LogInformation($"RoleProvider token: {query.Token}");
                _logger.LogInformation($"RoleProvider methodArn: {query.MethodArn}");

                var guestId = JwtClaimHelper.GetGuestIdFromToken(query.Token, audience);

                _logger.LogInformation($"RoleProvider guestId: {guestId}");
                _logger.LogInformation($"RoleProvider audience: {audience}");
                
                var results = await _dynamoDBProvider.QueryByGuestIdIndex(audience, guestId);

                _logger.LogInformation($"RoleProvider query guest result: {results}");

                if (results == null || results.Count > 1)
                {
                    _logger.LogError("More than one entity result");
                    throw new UnauthorizedAccessException("Access denied");
                }

                entity = results.FirstOrDefault();
                if (entity == null)
                {
                    throw new UnauthorizedAccessException($"Could not find matching user. Ip: {query.IpAddress}");
                }

                await TryUpdateUser(entity, query.Token!);
                await TryUpdateFamilyUnit(query.JwtAudience, entity.InvitationCode);

                entity.LastActivity = DateTime.UtcNow;
                user = _mapper.Map<GuestDto>(entity);

                await _dynamoDBProvider.SaveAsync(query.JwtAudience, entity);

                return user;
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, $"InvalidOperationException {ex.Message}");
                throw new InvalidOperationException(ex.Message, ex);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, $"UnauthorizedAccessException {ex.Message}");
                throw new UnauthorizedAccessException(ex.Message, ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Exception {ex.Message}");
                throw new UnauthorizedAccessException($"User not found. {ex.Message}");
            }
        }

        public async Task TryUpdateUser(WeddingEntity matchingGuest, string token)
        {
            if (matchingGuest == null || string.IsNullOrEmpty(matchingGuest.InvitationCode))
            {
                throw new UnauthorizedAccessException($"Guest not found.");
            }

            var missingAuthenticatedInfo = string.IsNullOrEmpty(matchingGuest.Auth0Id);
            _logger.LogInformation($"Has saved auth info: {!missingAuthenticatedInfo}");

            if (missingAuthenticatedInfo)
            {
                var authenticatedUser = await _authenticationProvider.GetUserInfo(token);
                _logger.LogInformation($"Saving authenticated user info: {JsonSerializer.Serialize(authenticatedUser)}");

                if (matchingGuest.AdditionalFirstNames == null)
                {
                    matchingGuest.AdditionalFirstNames = new List<string>();
                }

                if (!string.IsNullOrEmpty(authenticatedUser.Nickname) && !matchingGuest.AdditionalFirstNames.Contains(authenticatedUser.Nickname))
                {
                    matchingGuest.AdditionalFirstNames.Add(authenticatedUser.Nickname);
                }

                if (!string.IsNullOrEmpty(matchingGuest.Auth0Id) && !matchingGuest.Auth0Id.Equals(authenticatedUser.UserId))
                {
                    var message = $"Invalid operation: Account already created for this guest. Please login with {matchingGuest.Email}.";
                    throw new InvalidOperationException(message);
                }

                matchingGuest.Auth0Id = authenticatedUser.UserId;
                matchingGuest.Email = authenticatedUser.Email;
                matchingGuest.EmailVerified = new VerifyDto()
                {
                    Verified = authenticatedUser.EmailVerified ?? false
                }.ToString();
            }
        }

        public async Task TryUpdateFamilyUnit(string audience, string invitationCode)
        {
            try
            {
                var familyUnit = await _dynamoDBProvider.LoadFamilyUnitOnlyAsync(audience, invitationCode);
                if (familyUnit == null)
                {
                    throw new Exception($"Family unit not found. Audience: {audience}, InvitationCode: {invitationCode}");
                }

                familyUnit.FamilyUnitLastLogin = DateTime.UtcNow;
                await _dynamoDBProvider.SaveAsync(audience, familyUnit);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
            }
        }
    }
}
