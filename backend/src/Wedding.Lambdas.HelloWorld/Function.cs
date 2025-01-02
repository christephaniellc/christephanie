using System;
using Amazon.Lambda.Core;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using Wedding.Common.DI;
using Wedding.Lambdas.HelloWorld.Handlers;
using System.Net;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Common.Helpers.AWS;

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

            return result.OkResponse();
        }
        catch (Exception ex)
        {
            var error = $"Error occurred: {ex.Message}";
            context.Logger.LogError(error);

            return error.ErrorResponse((int)HttpStatusCode.InternalServerError, typeof(Exception).ToString());
        }
    }
}
