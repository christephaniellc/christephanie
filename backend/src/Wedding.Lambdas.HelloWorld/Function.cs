using System;
using Amazon.Lambda.Core;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using Wedding.Common.DI;
using Wedding.Lambdas.HelloWorld.Handlers;

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
    /// <param name="name">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<string> FunctionHandler(ILambdaContext context)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<HelloWorldHandler>();
            return await handler.GetAsync();
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"Error occurred: {ex.Message}");
            throw;
        }
    }
}
