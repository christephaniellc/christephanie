using Amazon.Lambda.APIGatewayEvents;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.DI;
using Amazon.Lambda.Core;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Handlers;
using Wedding.Lambdas.Authorize.Providers;
using System.Net;
using System.Text.Json;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Wedding.Lambdas.Authorize;
using Wedding.Common.Configuration.Identity;

public class Function
{
    // private static string AUTH0_DOMAIN = "your-auth0-domain";
    // private static string AUDIENCE = "your-api-audience";
    // private static string TABLE_NAME = "UserRolesTable";

    private readonly ServiceProvider _serviceProvider;

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

                //var dynamoContext = services.AddSingleton<IDynamoDBContext, DynamoDBContext>();
                var dynamoDbContext = sp.GetRequiredService<IDynamoDBContext>();
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

    //public async Task<APIGatewayCustomAuthorizerResponse> FunctionHandler(APIGatewayCustomAuthorizerRequest request, ILambdaContext context)
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayCustomAuthorizerRequest request, ILambdaContext context)
    {
        var token = request.AuthorizationToken?.Replace("Bearer ", "");

        context.Logger.LogInformation($"Raw Auth Bearer Input: {token}");

        if (string.IsNullOrEmpty(token))
            throw new UnauthorizedAccessException("Authorization token is missing");
        

        // TODO: fix, add role by request parameters
        var identity = "";
        //var audience = AUDIENCE;
        var query = new ValidateAuthorizationQuery(
            token, 
            request.MethodArn);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<AuthorizeHandler>();
            var result = await handler.GetAsync(query);


            // return new APIGatewayCustomAuthorizerResponse
            // {
            //     PolicyDocument = null,
            //     PrincipalID = null,
            //     Context = null,
            //     UsageIdentifierKey = null
            // };

            if (result == null)
            {
                return new APIGatewayProxyResponse
                {
                    StatusCode = (int)HttpStatusCode.Unauthorized,
                    IsBase64Encoded = false,
                    Headers = new Dictionary<string, string>
                    {
                        { "Content-Type", "application/json" }
                    },
                    Body = JsonSerializer.Serialize(result)
                };
            }

            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.OK,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = JsonSerializer.Serialize(result)
            };
        }
        catch (Exception ex)
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.Unauthorized,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = JsonSerializer.Serialize(ex.Message)
            };
        }
    }
}
