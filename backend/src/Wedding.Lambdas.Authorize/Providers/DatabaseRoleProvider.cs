using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.JwtClaim;
using Wedding.Lambdas.Authorize.Commands;

namespace Wedding.Lambdas.Authorize.Providers
{
    public class DatabaseRoleProvider : IAuthorizationProvider
    {
        private ILogger<DatabaseRoleProvider> _logger;
        private readonly IMapper _mapper;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IAuthenticationProvider _authenticationProvider;

        public DatabaseRoleProvider(ILogger<DatabaseRoleProvider> logger, IMapper mapper, IDynamoDBProvider dynamoDBProvider, IAuthenticationProvider authenticationProvider)
        {
            _logger = logger;
            _mapper = mapper;
            _dynamoDBProvider = dynamoDBProvider;
            _authenticationProvider = authenticationProvider;
        }

        private string GetRequiredPermissionByEndpoint(string methodArn)
        {
            switch (methodArn)
            {
                case (LambdaArns.AdminFamilyUnitCreate):
                case (LambdaArns.AdminFamilyUnitUpdate):
                case (LambdaArns.AdminFamilyUnitDelete):
                    return RoleEnum.Admin.ToString();
                default:
                    return RoleEnum.Guest.ToString();
            }
        }

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
                
                var results = await _dynamoDBProvider.QueryByGuestIdIndex(guestId);

                _logger.LogInformation($"RoleProvider query guest result: {results}");

                if (results == null || results.Count > 1)
                {
                    _logger.LogError("More than one entity result");
                    throw new UnauthorizedAccessException("Access denied");
                }

                entity = results.FirstOrDefault();

                if (string.IsNullOrEmpty(entity.Auth0Id))
                {
                    _logger.LogInformation("Auth0Id is null, updating...");
                    var authenticatedUser = await _authenticationProvider.GetUserInfo(query.Token);
                    _logger.LogInformation(
                        $"RoleProvider authenticated User: {JsonSerializer.Serialize(authenticatedUser)}");
                    authenticatedUser.InvitationCode = entity.InvitationCode;
                    await TryUpdateUser(entity, authenticatedUser);
                }

                await TryUpdateFamilyUnit(entity.InvitationCode);

                entity.LastActivity = DateTime.UtcNow;
                user = _mapper.Map<GuestDto>(entity);

                await _dynamoDBProvider.SaveAsync(entity);

                return user;
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, $"UnauthorizedAccessException {ex.Message}");
                throw ex;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Exception {ex.Message}");
                throw new UnauthorizedAccessException($"User not found. {ex.Message}");
            }
        }

        public async Task TryUpdateUser(WeddingEntity matchingGuest, Auth0User user)
        {
            if (matchingGuest == null || string.IsNullOrEmpty(matchingGuest.InvitationCode))
            {
                throw new UnauthorizedAccessException($"Guest not found.");
            }

            if (matchingGuest.AdditionalFirstNames == null)
            {
                matchingGuest.AdditionalFirstNames = new List<string>();
            }

            if (!string.IsNullOrEmpty(user.Nickname))
            {
                matchingGuest.AdditionalFirstNames.Add(user.Nickname);
            }
            
            matchingGuest.Auth0Id = user.UserId;
            matchingGuest.Email = user.Email;
            matchingGuest.EmailVerified = user.EmailVerified ?? false;
        }

        public async Task TryUpdateFamilyUnit(string invitationCode)
        {
            try
            {
                var familyUnit = await _dynamoDBProvider.LoadFamilyUnitOnlyAsync(invitationCode);

                familyUnit.FamilyUnitLastLogin = DateTime.UtcNow;
                _dynamoDBProvider.SaveAsync(familyUnit);
            }
            catch (Exception ex)
            {
                // nothing
                var test = ex.Message;
            }
        }
    }
}
