using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Wedding.Abstractions.Dtos;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Handlers;
using Wedding.Lambdas.Authorize.Providers;

namespace Wedding.Lambdas.UnitTests.TestData
{
    public class TestAuthorizer
    {
        private readonly TestTokenHelper _testTokenHelper;
        private readonly Mock<IAuthorizationProvider> _mockDatabaseRoleProvider;
        private readonly AuthHandler _authHandler;
        private readonly Wedding.Lambdas.Authorize.Function _authFunction;

        public TestAuthorizer(IConfigurationRoot configuration, ServiceCollection serviceCollection)
        {
            _testTokenHelper = new TestTokenHelper(configuration);
            _mockDatabaseRoleProvider = new Mock<IAuthorizationProvider>();

            _authHandler = new AuthHandler(new Mock<ILogger<AuthHandler>>().Object, _mockDatabaseRoleProvider.Object);

            serviceCollection.AddScoped(_ => _authHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            _authFunction = new Wedding.Lambdas.Authorize.Function(serviceProvider, _testTokenHelper.JwtAuthority, _testTokenHelper.JwtAudience);
        }

        public async Task<APIGatewayCustomAuthorizerResponse> MockAuthorize(GuestDto authorizeThisUser, string routeKey = "GET /api/familyunit")
        {
            var context = new TestLambdaContext();

            var token = await _testTokenHelper.GenerateAuth0Token(authorizeThisUser.GuestId);

            _mockDatabaseRoleProvider.Setup(x => x.Authorize(It.IsAny<ValidateAuthQuery>()))
                .ReturnsAsync(authorizeThisUser);

            var authRequest = new APIGatewayCustomAuthorizerRequest
            {
                AuthorizationToken = token,
                MethodArn = LambdaArns.Auth,
                Headers = new Dictionary<string, string>
                {
                    { "authorization", "Bearer " + token }
                },
                RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
                {
                    RouteKey = routeKey
                }
            };
            return await _authFunction.FunctionHandler(authRequest, context);
        }
    }
}
