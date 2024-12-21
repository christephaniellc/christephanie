using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Lambda.APIGatewayEvents;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Common.Abstractions;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Enums;
using Wedding.Lambdas.Authorize.Providers;
using Wedding.Lambdas.Authorize.Validation;

namespace Wedding.Lambdas.Authorize.Handlers
{
    public class AuthorizeHandler :
        IAsyncQueryHandler<ValidateAuthorizationQuery, APIGatewayCustomAuthorizerResponse>
    {
        private readonly ILogger<AuthorizeHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;
        private readonly IAuthorizationProvider _authProvider;

        public AuthorizeHandler(ILogger<AuthorizeHandler> logger, IDynamoDBContext repository, IMapper mapper, IAuthorizationProvider authProvider)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
            _authProvider = authProvider;
        }

        public async Task<APIGatewayCustomAuthorizerResponse> GetAsync(ValidateAuthorizationQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                return await _authProvider.IsAuthorized(query.Token, query.MethodArn);
            }
            catch (UnauthorizedAccessException ex)
            {
                return _authProvider.GeneratePolicy(PolicyEffectEnum.Deny, query.MethodArn);
            }
            catch (Exception ex)
            {
                return _authProvider.GeneratePolicy(PolicyEffectEnum.Deny, query.MethodArn);
            }
        }
    }
}
