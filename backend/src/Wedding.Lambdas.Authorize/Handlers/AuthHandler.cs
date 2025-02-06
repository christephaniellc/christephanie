using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Enums;
using Wedding.Common.Abstractions;
using Wedding.Common.Auth;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Authorize.Validation;

namespace Wedding.Lambdas.Authorize.Handlers
{
    public class AuthHandler :
        IAsyncQueryHandler<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse>
    {
        private readonly ILogger<AuthHandler> _logger;
        private readonly IAuthorizationProvider _databaseRoleProvider;

        public AuthHandler(ILogger<AuthHandler> logger,
            IAuthorizationProvider databaseRoleProvider)
        {
            try
            {
                Console.WriteLine("AuthHandler constructor invoked");
                _logger = logger;
                _databaseRoleProvider = databaseRoleProvider;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in AuthHandler constructor: {ex.Message}");
                throw;
            }
        }

        public async Task<APIGatewayCustomAuthorizerResponse> GetAsync(ValidateAuthQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation("Entering AuthHandler.GetAsync");
            Console.WriteLine($"CONSOLE: AuthHandler token: {query.Token}");

            query.Validate(nameof(query));

            try
            {
                var token = query.Token.Replace("Bearer ", "");
                var authorizedUser = await _databaseRoleProvider.Authorize(query);
                var isAuthorized = authorizedUser.Roles != null && authorizedUser.Roles.Count > 0;

                _logger.LogInformation($"AuthHandler authorized user [audience: {query.JwtAudience}] (authorized? {isAuthorized}): {JsonSerializer.Serialize(authorizedUser)}");

                var policy = APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy( //isAuthenticated & 
                    isAuthorized
                        ? PolicyEffectEnum.Allow
                        : PolicyEffectEnum.Deny,
                    query.MethodArn, 
                    audience: query.JwtAudience,
                    token, 
                    query.IpAddress,
                    authorizedUser);

                _logger.LogInformation($"Policy: {JsonSerializer.Serialize(policy)}");

                return policy;
            }
            catch (InvalidOperationException ex)
            {
                return APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy(PolicyEffectEnum.Deny, 
                    query.MethodArn,
                    audience: query.JwtAudience, 
                    error: ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy(PolicyEffectEnum.Deny, 
                    query.MethodArn,
                    audience: query.JwtAudience, 
                    error: ex.Message);
            }
            catch (Exception ex)
            {
                return APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy(PolicyEffectEnum.Deny, 
                    query.MethodArn,
                    audience: query.JwtAudience, 
                    error: ex.Message);
            }
        }
    }
}
