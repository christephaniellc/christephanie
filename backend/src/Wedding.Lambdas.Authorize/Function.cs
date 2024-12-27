using Amazon.Lambda.APIGatewayEvents;
using System.Threading.Tasks;
using System;
using Amazon.DynamoDBv2.DataModel;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.DI;
using Amazon.Lambda.Core;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Handlers;
using Wedding.Lambdas.Authorize.Providers;
using AutoMapper;
using Wedding.Common.Configuration.Identity;
using Wedding.Abstractions.Enums;

namespace Wedding.Lambdas.Authorize;
public class Function
{
    private readonly ServiceProvider _serviceProvider;
    private string _authority;
    private string _audience;

    public Function()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));

        serviceCollection.AddScoped<AuthHandler>();
        serviceCollection.AddScoped<Auth0Provider>();
        serviceCollection.AddScoped<DatabaseRoleProvider>(sc =>
        {
            var mapper = sc.GetRequiredService<IMapper>();
            var dynamoDbContext = sc.GetRequiredService<IDynamoDBContext>();

            return new DatabaseRoleProvider(mapper, dynamoDbContext);
        });

        serviceCollection.AddSingleton<Lazy<Task<Auth0Provider>>>(sc =>
        {
            return new Lazy<Task<Auth0Provider>>(async () =>
            {
                var region = AwsRegionHelper.GetRegionEndpointFromEnvironment();
                var authConfig = await AwsParameterStoreHelper.GetParameterAsync<Auth0Configuration>("/auth0/api/credentials", region);
                _authority = authConfig.Authority ?? throw new InvalidOperationException();
                _audience = authConfig.Audience ?? throw new InvalidOperationException();

                var mapper = sc.GetRequiredService<IMapper>();

                return new Auth0Provider(mapper,
                    authConfig.Authority ?? throw new InvalidOperationException(),
                    authConfig.Audience ?? throw new InvalidOperationException());
            });
        });

        _serviceProvider = serviceCollection.BuildServiceProvider();
    }

    public async Task<APIGatewayCustomAuthorizerResponse> FunctionHandler(APIGatewayCustomAuthorizerRequest request, ILambdaContext context)
    {
        context.Logger.LogInformation($"Raw Auth Bearer Input: { request.AuthorizationToken }");
        var invitationCode = request.GetInvitationCode();
        var firstName = request.GetFirstName();

        var query = new ValidateAuthQuery(
            request.AuthorizationToken,
            _authority,
            _audience,
            request.MethodArn);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<AuthHandler>();
            var result = await handler.GetAsync(query);

            return result;
        }
        catch (Exception ex)
        {
            return APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy(PolicyEffectEnum.Deny, query.MethodArn, error: $"Auth exception: {ex.Message}");
        }
    }
}
