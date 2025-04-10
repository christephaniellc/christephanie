using System;
using System.Net;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Payments.Intent.Confirm.Commands;
using Wedding.Lambdas.Payments.Intent.Confirm.Handlers;

namespace Wedding.Lambdas.Payments.Intent.Confirm;

public class Function
{
    private readonly ServiceProvider _serviceProvider;

    public Function() : this(BuildDefaultServiceProvider())
    {
    }

    public Function(ServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    private static ServiceProvider BuildDefaultServiceProvider()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));
        serviceCollection.AddScoped<StripeWebhookHandler>();

        serviceCollection.AddSingleton<Lazy<Task<IStripePaymentProvider>>>(sp =>
        {
            return new Lazy<Task<IStripePaymentProvider>>(async () =>
            {
                var logger = sp.GetRequiredService<ILogger<StripePaymentProvider>>();
                var config = await AwsParameterCache.GetConfigAsync<StripeConfiguration>();
                return new StripePaymentProvider(logger, config);
            });
        });

        serviceCollection.AddScoped<IStripePaymentProvider>(sp =>
        {
            var lazyProvider = sp.GetRequiredService<Lazy<Task<IStripePaymentProvider>>>();
            return lazyProvider.Value.GetAwaiter().GetResult();
        });
        
        serviceCollection.AddSingleton<Lazy<Task<IAwsSesHelper>>>(sp =>
        {
            return new Lazy<Task<IAwsSesHelper>>(async () =>
            {
                var config = await AwsParameterCache.GetConfigAsync<ApplicationConfiguration>();
                return new AwsSesHelper(config);
            });
        });

        serviceCollection.AddScoped<IAwsSesHelper>(sp =>
        {
            var lazyProvider = sp.GetRequiredService<Lazy<Task<IAwsSesHelper>>>();
            return lazyProvider.Value.GetAwaiter().GetResult();
        });

        return serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Admin function that creates a family unit
    /// </summary>
    /// <param name="request">The request event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {System.Text.Json.JsonSerializer.Serialize(request)}");
            context.Logger.LogInformation($"HttpMethod: {request.HttpMethod?.ToUpperInvariant()}");

            using var scope = _serviceProvider.CreateScope();

            var handler = scope.ServiceProvider.GetRequiredService<StripeWebhookHandler>();

            var query = new GetPaymentIntentStatusQuery(request.Body, request.Headers["Stripe-Signature"]); 

            var result = await handler.GetAsync(query);
            return result.OkResponse();
        }
        catch (UnauthorizedAccessException ex)
        {
            var error = $"Authorization exception: {ex.Message}";
            context.Logger.LogError(error);

            return error.ErrorResponse((int)HttpStatusCode.Unauthorized, typeof(UnauthorizedAccessException).ToString());
        }
        catch (ValidationException ex)
        {
            var error = $"Validation exception: {ex.Message}";
            context.Logger.LogError(error);

            return error.ErrorResponse((int)HttpStatusCode.BadRequest, typeof(ValidationException).ToString());
        }
        catch (Exception ex)
        {
            var error = $"Error occurred: {ex.Message}";
            context.Logger.LogError(error);

            return error.ErrorResponse((int)HttpStatusCode.InternalServerError, typeof(Exception).ToString());
        }
    }
}
