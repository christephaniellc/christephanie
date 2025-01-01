using System;
using Amazon.Lambda.Core;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using Wedding.Common.DI;
using Wedding.Lambdas.HelloWorld.Handlers;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Common.Helpers.AWS.Frontend;
using Microsoft.AspNetCore.Http;

namespace Wedding.Lambdas.HelloWorld;

public class Function
{
    private readonly ServiceProvider _serviceProvider;

    public Function()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));
        serviceCollection.AddScoped<HelloWorldHandler>();

        _serviceProvider = serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Returns hello world
    /// </summary>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(ILambdaContext context)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<HelloWorldHandler>();
            var result = await handler.GetAsync();

            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.OK,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = new FrontendApiResponse
                {
                    Data = JsonSerializer.SerializeToElement(result)
                }.ToBody()
            };
        }
        catch (Exception ex)
        {
            var statusCode = (int)HttpStatusCode.InternalServerError;
            var error = $"Error occurred: {ex.Message}";
            context.Logger.LogError(error);

            return new APIGatewayProxyResponse
            {
                StatusCode = statusCode,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = new FrontendApiResponse
                {
                    Error = new FrontendApiError
                    {
                        Status = statusCode,
                        Error = typeof(Exception).ToString(),
                        Description = error
                    }
                }.ToBody()
            };
        }
    }
}
