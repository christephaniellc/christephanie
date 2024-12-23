using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Lambda.APIGatewayEvents;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Enums;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Providers;
using Wedding.Lambdas.Authorize.Validation;

namespace Wedding.Lambdas.Authorize.Handlers
{
    public class AuthHandler :
        IAsyncQueryHandler<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse>
    {
        private readonly ILogger<AuthHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;
        private readonly IAuthenticationProvider _authProvider;
        private readonly IAuthorizationProvider _databaseRoleProvider;

        public AuthHandler(ILogger<AuthHandler> logger, 
            IDynamoDBContext repository, 
            IMapper mapper, 
            IAuthenticationProvider authProvider, 
            IAuthorizationProvider databaseRoleProvider)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
            _authProvider = authProvider;
            _databaseRoleProvider = databaseRoleProvider;
        }

        public async Task<APIGatewayCustomAuthorizerResponse> GetAsync(ValidateAuthQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var token = query.Token.Replace("Bearer ", "");

                var authenticatedUser = await _authProvider.Authenticate(token);
                var authorizedUser = await _databaseRoleProvider.Authorize(authenticatedUser, query.MethodArn, query.InvitationCode, query.FirstName);

                var isAuthenticated = authenticatedUser != null;
                var isAuthorized = authorizedUser.Roles != null && authorizedUser.Roles.Count > 0;

                return APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy(isAuthenticated & isAuthorized
                        ? PolicyEffectEnum.Allow 
                        : PolicyEffectEnum.Deny, 
                    query.MethodArn, token, authenticatedUser);
            }
            catch (UnauthorizedAccessException ex)
            {
                return APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy(PolicyEffectEnum.Deny, query.MethodArn);
            }
            catch (Exception ex)
            {
                return APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy(PolicyEffectEnum.Deny, query.MethodArn);
            }
        }
    }
}
