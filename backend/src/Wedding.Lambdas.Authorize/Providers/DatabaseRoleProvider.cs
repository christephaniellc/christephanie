using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth0;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Common.Helpers.JwtClaim;
using Wedding.Lambdas.Authorize.Commands;

namespace Wedding.Lambdas.Authorize.Providers
{
    public class DatabaseRoleProvider : IAuthorizationProvider
    {
        private readonly IMapper _mapper;
        private readonly IDynamoDBContext _repository;
        private readonly IAuthenticationProvider _authProvider;

        public DatabaseRoleProvider(IMapper mapper, IDynamoDBContext repository, IAuthenticationProvider authProvider)
        {
            _mapper = mapper;
            _repository = repository;
            _authProvider = authProvider;
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

            return requiresFamilyBelonging ? authenticatedUser.RsvpCode.ToUpper() == methodInvitationCode.ToUpper() : true;
        }

        /// <summary>
        /// Auth0User has UserId (auth0) and GuestId (lives on AppData obj)
        ///
        /// If coming through auth layer, can be scenarios:
        /// 1. 
        /// 2. Has Auth0Id saved to guest entity
        /// </summary>
        /// <param name="authenticatedUser"></param>
        /// <param name="methodArn"></param>
        /// <returns></returns>
        /// <exception cref="UnauthorizedAccessException"></exception>
        public async Task<GuestDto?> Authorize(string token, string methodArn)
        {
            try
            {
                GuestDto? user = null;
                WeddingEntity? entity = null;

                var guestId = JwtClaimHelper.GetGuestIdFromToken(token, _authProvider.GetAudience());

                var queryConfig = new DynamoDBOperationConfig
                {
                    IndexName = DynamoKeys.GuestIdIndex
                };

                var result = await _repository.LoadAsync<WeddingEntity>(guestId, queryConfig);

                if (result == null)
                {
                    throw new UnauthorizedAccessException("Access denied");
                }

                entity = result;

                if (string.IsNullOrEmpty(entity.Auth0Id))
                {
                    var authenticatedUser = await _authProvider.GetUserInfo(token);
                    authenticatedUser.InvitationCode = entity.RsvpCode;
                    await TryUpdateUser(entity, authenticatedUser);
                }

                await TryUpdateFamilyUnit(entity.RsvpCode);

                user = _mapper.Map<GuestDto>(entity);
                entity.GuestLogins.Add(DateTime.UtcNow);

                var permissions = user.Roles.Select(r => r.ToString().ToUpper());
                var requestedPermission = GetRequiredPermissionByEndpoint(methodArn).ToUpper();

                // TODO think about this
                if (!permissions.Contains(requestedPermission) && !user.IsAdmin())
                    //!IsAuthorizedToViewThisPage(user, true, methodInvitationCode))
                {
                    throw new UnauthorizedAccessException("Access denied");
                }

                _repository.SaveAsync(entity);

                return user;
            }
            catch (UnauthorizedAccessException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw new UnauthorizedAccessException($"User not found. {ex.Message}");
            }
        }

        public async Task TryUpdateUser(WeddingEntity matchingGuest, Auth0User user)
        {
            if (matchingGuest == null || string.IsNullOrEmpty(matchingGuest.RsvpCode))
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
            matchingGuest.EmailVerified = user.EmailVerified;
        }

        public async Task TryUpdateFamilyUnit(string invitationCode)
        {
            try
            {
                var familyUnitPartitionKey = DynamoKeys.GetFamilyUnitPartitionKey(invitationCode);
                var familyUnitSortKey = DynamoKeys.GetFamilyInfoSortKey();
                var item = await _repository.LoadAsync<WeddingEntity>(familyUnitPartitionKey, familyUnitSortKey);

                item.FamilyUnitLastLogin = DateTime.UtcNow;
                _repository.SaveAsync(item);
            }
            catch (Exception ex)
            {
                // nothing
                var test = ex.Message;
            }
        }
    }
}
