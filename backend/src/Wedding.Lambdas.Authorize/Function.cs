using Amazon.Lambda.APIGatewayEvents;
using System.Threading.Tasks;
using System;
using System.Linq;
using Amazon.DynamoDBv2.DataModel;
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
using Amazon;
using Microsoft.Extensions.Logging;

namespace Wedding.Lambdas.Authorize;

public class Function
{
    private readonly ILambdaLogger _logger;
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
            var dynamoDbContext = sc.GetRequiredService<IDynamoDBContext>();
            var authenticationProvider = sc.GetRequiredService<IAuthenticationProvider>();

            return new DatabaseRoleProvider(logger, mapper, dynamoDbContext, authenticationProvider);
        });

        return serviceCollection.BuildServiceProvider();
    }

    public async Task<APIGatewayCustomAuthorizerResponse> FunctionHandler(APIGatewayCustomAuthorizerRequest request, ILambdaContext context)
    {
        context.Logger.LogInformation($"Received event: {JsonSerializer.Serialize(request)}");
        context.Logger.LogInformation($"Raw Auth Bearer Input: { request.AuthorizationToken }");
        context.Logger.LogInformation($"LambdaContext: {JsonSerializer.Serialize(context)}");

        // foreach (var header in request.Headers)
        // {
        //     context.Logger.LogInformation($"{header.Key}: {header.Value}");
        // }

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
            var region = AwsRegionHelper.GetRegionEndpointFromEnvironment();
            var authConfig = await AwsParameterCache.GetAuthConfigAsync("/auth0/api/credentials", region);
            _authority = authConfig.Authority ?? throw new InvalidOperationException();
            _audience = authConfig.Audience ?? throw new InvalidOperationException();
        }

        context.Logger.LogInformation($"Authorization header: {authorizationHeader}");
        context.Logger.LogInformation($"Authority: {_authority}");
        context.Logger.LogInformation($"Audience: {_audience}");
        context.Logger.LogInformation($"RouteKey: {routeKey}");

        var query = new ValidateAuthQuery(
            _authority,
            _audience,
            routeKey,
            authorizationHeader.Replace("Bearer ", ""));

        try
        {
            context.Logger.LogInformation("Logging before calling AuthHandler");
            using var scope = _serviceProvider.CreateScope(); 
            context.Logger.LogInformation("Logging after calling AuthHandler");
            var handler = scope.ServiceProvider.GetRequiredService<AuthHandler>();
            if (handler == null)
            {
                context.Logger.LogError("Failed to resolve AuthHandler. It is null.");
                throw new InvalidOperationException("AuthHandler resolution failed.");
            }
            context.Logger.LogInformation("Logging before calling GetRequiredService");
            var result = await handler.GetAsync(query);

            return result;
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"Function Exception Message: {ex.Message}");
            //context.Logger.LogError($"Function Exception: {JsonSerializer.Serialize(ex)}");
            return APIGatewayCustomAuthorizerResponseExtensions.GeneratePolicy(PolicyEffectEnum.Deny, query.MethodArn, error: $"Auth exception: {ex.Message}");
        }
    }
}
