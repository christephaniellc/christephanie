using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public class InternalAuthorizationProvider : IAuthorizationProvider
    {
        private readonly IDynamoDBContext _repository;

        public static AuthResponse UNAUTHORIZED = new AuthResponse
        {
            ResponseStatusCode = HttpStatusCode.Unauthorized,
            ResponseMessage = "You do not have access."
        };

        public InternalAuthorizationProvider(IDynamoDBContext repository)
        {
            _repository = repository;
        }

        public async Task<AuthResponse> ValidateAdminClaims(AuthResponse response)
        {
            // var authorizationQuery = new ValidateAuthorizationQuery(response.Identity, RoleEnum.Admin);
            //
            // try
            // {
            //     var queryConfig = new QueryOperationConfig
            //     {
            //         IndexName = "Auth0IdIndex", // Name of the GSI
            //         KeyExpression = new Expression
            //         {
            //             ExpressionStatement = "Auth0Id = :auth0Id",
            //             ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
            //             {
            //                 { ":auth0Id", response.Identity }
            //             }
            //         },
            //         ConsistentRead = false // Use consistent reads only if required
            //     };
            //
            //     var search = _repository.FromQueryAsync<WeddingEntity>(queryConfig);
            //     var results = await search.GetRemainingAsync();
            //
            //     // Return the first result or null if none found
            //     var validRoles = UserRoles(results.FirstOrDefault());
            //     if (validRoles == null || !validRoles.Contains(RoleEnum.Admin))
            //     {
            //         return UNAUTHORIZED;
            //     }
            //
            //     response.ResponseStatusCode = HttpStatusCode.OK;
            //     response.Authorized = true;
            //     response.ResponseMessage = "You have access.";
            // }
            // catch (Exception ex)
            // {
            //     UNAUTHORIZED.ResponseMessage = ex.Message;
            //     return UNAUTHORIZED;
            // }

            return UNAUTHORIZED;
        }

        public List<RoleEnum>? UserRoles(WeddingEntity entity)
        {
            if (entity == null)
            {
                return null;
            }
            return entity.Roles;
        }
    }
}
