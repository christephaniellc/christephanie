using Amazon.Lambda.APIGatewayEvents;
using System.Threading.Tasks;
using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.DI;
using Amazon.Lambda.Core;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Handlers;
using Wedding.Lambdas.Authorize.Providers;
using AutoMapper;
using Wedding.Abstractions.Enums;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Wedding.Lambdas.Authorize;

public class Function
{
    private readonly ServiceProvider _serviceProvider;
    private static string _authority;
    private static string _audience;

    public Function() : this(BuildDefaultServiceProvider())
    {
    }

    public Function(ServiceProvider serviceProvider, string? authority = null, string? audience = null)
    {
        _serviceProvider = serviceProvider;

        if (!string.IsNullOrEmpty(authority))
        {
            _authority = authority;
        }

        if (!string.IsNullOrEmpty(audience))
        {
            _audience = audience;
        }
    }

    private static ServiceProvider BuildDefaultServiceProvider()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));

        serviceCollection.AddScoped<AuthHandler>();
        serviceCollection.AddScoped<IAuthenticationProvider, Auth0Provider>();
        serviceCollection.AddScoped<IAuthorizationProvider, DatabaseRoleProvider>(sc =>
        {
            var logger = sc.GetRequiredService<ILogger<DatabaseRoleProvider>>();
            var mapper = sc.GetRequiredService<IMapper>();
            var dynamoDbProvider= sc.GetRequiredService<IDynamoDBProvider>();
            var authenticationProvider = sc.GetRequiredService<IAuthenticationProvider>();

            return new DatabaseRoleProvider(logger, mapper, dynamoDbProvider, authenticationProvider);
        });

        return serviceCollection.BuildServiceProvider();
    }

    public async Task<APIGatewayCustomAuthorizerResponse> FunctionHandler(APIGatewayCustomAuthorizerRequest request, ILambdaContext context)
    {
        context.Logger.LogInformation($"Received event: {JsonSerializer.Serialize(request)}");
        context.Logger.LogInformation($"Raw Auth Bearer Input: { request.AuthorizationToken }");
        context.Logger.LogDebug($"LambdaContext: {JsonSerializer.Serialize(context)}");

        foreach (var header in request.Headers)
        {
            context.Logger.LogDebug($"{header.Key}: {header.Value}");
        }

        var authorizationHeader = request.Headers
            .FirstOrDefault(h => string.Equals(h.Key, "Authorization", StringComparison.OrdinalIgnoreCase))
            .Value;

        if (string.IsNullOrEmpty(authorizationHeader))
        {
            context.Logger.LogError("Authorization header is missing.");
            throw new UnauthorizedAccessException("Unauthorized");
        }

        var routeKey = request.RequestContext.RouteKey;

        if (string.IsNullOrEmpty(_authority) || string.IsNullOrEmpty(_audience))
        {
            //AwsParameterCache.ClearCache();
            var region = AwsRegionHelper.GetRegionEndpointFromEnvironment();
            var authConfig = await AwsParameterCache.GetAuthConfigAsync("/auth0/api/credentials", region);
            _authority = authConfig.Authority ?? throw new InvalidOperationException();
            _audience = authConfig.Audience ?? throw new InvalidOperationException();
        }

        context.Logger.LogDebug($"Authorization header: {authorizationHeader}");
        context.Logger.LogDebug($"Authority: {_authority}");
        context.Logger.LogDebug($"Audience: {_audience}");
        context.Logger.LogDebug($"RouteKey: {routeKey}");
        context.Logger.LogDebug($"Arn: {LambdaArnTranslations.ConvertToArn(routeKey)}");

        var query = new ValidateAuthQuery(
            _authority,
            _audience,
            LambdaArnTranslations.ConvertToArn(routeKey),
            authorizationHeader.Replace("Bearer ", ""));

        try
        {
            using var scope = _serviceProvider.CreateScope(); 
            var handler = scope.ServiceProvider.GetRequiredService<AuthHandler>();
            var result = await handler.GetAsync(query);

            return result;
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"Function Exception Message: {ex.Message}");
            return APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy(PolicyEffectEnum.Deny, query.MethodArn, error: $"Auth exception: {ex.Message}");
        }
    }
}
