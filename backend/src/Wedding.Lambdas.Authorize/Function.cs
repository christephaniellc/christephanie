using Amazon.Lambda.APIGatewayEvents;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.DI;
using Amazon.Lambda.Core;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Handlers;
using Wedding.Lambdas.Authorize.Providers;
using AutoMapper;
using Wedding.Lambdas.Authorize;
using Wedding.Common.Configuration.Identity;
using Wedding.Lambdas.Authorize.Helpers;

public class Function
{
    private readonly ServiceProvider _serviceProvider;
    private string _authority;
    private string _audience;

    public Function()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));

        serviceCollection.AddScoped<AuthorizeHandler>();
        serviceCollection.AddScoped<Auth0Provider>();
        
        serviceCollection.AddSingleton<Lazy<Task<Auth0Provider>>>(sp =>
        {
            return new Lazy<Task<Auth0Provider>>(async () =>
            {
                var region = AwsRegionHelper.GetRegionEndpointFromEnvironment();
                var authConfig = await AwsParameterStoreHelper.GetParameterAsync<Auth0Configuration>("/auth0/api/credentials", region);
                _authority = authConfig.Authority ?? throw new InvalidOperationException();
                _audience = authConfig.Audience ?? throw new InvalidOperationException();

                //var dynamoDbContext = sp.GetRequiredService<IDynamoDBContext>();
                var mapper = sp.GetRequiredService<IMapper>();

                return new Auth0Provider(
                    authConfig.Authority ?? throw new InvalidOperationException(),
                    authConfig.Audience ?? throw new InvalidOperationException(),
                    authConfig.ClientId ?? throw new InvalidOperationException(),
                    authConfig.ClientSecret ?? throw new InvalidOperationException(),
                    mapper,
                    authConfig.DynamoUserTableName ?? throw new InvalidOperationException(),
                    authConfig.DynamoIdentityCol ?? throw new InvalidOperationException(),
                    authConfig.DynamoIdentityIndex ?? throw new InvalidOperationException()
                );
            });
        });

        _serviceProvider = serviceCollection.BuildServiceProvider();
    }

    public async Task<APIGatewayCustomAuthorizerResponse> FunctionHandler(APIGatewayCustomAuthorizerRequest request, ILambdaContext context)
    {
        context.Logger.LogInformation($"Raw Auth Bearer Input: { request.AuthorizationToken }");
        var invitationCode = request.GetInvitationCode();

        var query = new ValidateAuthorizationQuery(
            request.AuthorizationToken, 
            request.MethodArn,
            invitationCode,
            _authority,
            _audience);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<AuthorizeHandler>();
            var result = await handler.GetAsync(query);

            return result;
        }
        catch (Exception ex)
        { 
            //TODO SKS
            return new APIGatewayCustomAuthorizerResponse();
        }
    }
}
