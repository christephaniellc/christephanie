using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using NUnit.Framework.Interfaces;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth0;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Lambdas.Authorize.Commands;

namespace Wedding.Lambdas.Authorize.Providers
{
    public class DatabaseRoleProvider : IAuthorizationProvider
    {
        private readonly IMapper _mapper;
        private readonly IDynamoDBContext _repository;

        public DatabaseRoleProvider(IMapper mapper, IDynamoDBContext repository)
        {
            _mapper = mapper;
            _repository = repository;
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

        public async Task<Auth0User> Authorize(Auth0User authenticatedUser, string methodArn, string methodInvitationCode, string firstName)
        {
            try
            {
                GuestDto? user = null;
                WeddingEntity? entity = null;

                var queryConfig = new DynamoDBOperationConfig
                {
                    IndexName = DynamoKeys.IdentityIndex
                };

                var results = await _repository.QueryAsync<WeddingEntity>(authenticatedUser.UserId, queryConfig)
                    .GetRemainingAsync();

                if (results == null || results.Count == 0)
                {
                    var updateResult = await TryUpdateUser(authenticatedUser, methodInvitationCode, firstName);
                    if (updateResult != null)
                    {
                        entity = updateResult;
                    }
                }
                else
                {
                    entity = results.FirstOrDefault();
                    authenticatedUser.InvitationCode = entity.RsvpCode;
                    await TryUpdateFamilyUnit(authenticatedUser);
                }

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

                authenticatedUser.InvitationCode = user.RsvpCode;
                authenticatedUser.Roles = _mapper.Map<List<RoleEnum>>(permissions);

                return authenticatedUser;
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

        public async Task<WeddingEntity> TryUpdateUser(Auth0User user, string invitationCode, string firstName)
        {
            if (string.IsNullOrEmpty(invitationCode) || string.IsNullOrEmpty(firstName))
            {
                throw new UnauthorizedAccessException($"Could not find invitation {invitationCode} with first name {firstName}");
            }

            var familyUnitPartitionKey = DynamoKeys.GetFamilyUnitPartitionKey(invitationCode);
            var items = await _repository.QueryAsync<WeddingEntity>(familyUnitPartitionKey).GetRemainingAsync();

            var matchingGuest = items.FirstOrDefault(item =>
                item.FirstName?.ToUpper() == firstName.ToUpper() ||
                (
                    item.AdditionalFirstNames != null
                    && item.AdditionalFirstNames.Select(firstName => firstName.ToUpper()).Contains(firstName.ToUpper()))
                );

            if (matchingGuest == null)
            {
                throw new UnauthorizedAccessException($"Could not find invitation {invitationCode} with first name {firstName}");
            }

            if (matchingGuest.AdditionalFirstNames == null)
            {
                matchingGuest.AdditionalFirstNames = new List<string>();
            }
            
            matchingGuest.Auth0Id = user.UserId;
            matchingGuest.AdditionalFirstNames.Add(user.Nickname);
            matchingGuest.Email = user.Email;
            matchingGuest.EmailVerified = user.EmailVerified;

            return matchingGuest;
        }

        public async Task TryUpdateFamilyUnit(Auth0User user)
        {
            try
            {
                var familyUnitPartitionKey = DynamoKeys.GetFamilyUnitPartitionKey(user.InvitationCode);
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
