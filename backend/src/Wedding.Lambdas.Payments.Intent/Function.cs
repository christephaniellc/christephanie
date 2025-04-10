using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Payments.Intent.Commands;
using Wedding.Lambdas.Payments.Intent.Handlers;

namespace Wedding.Lambdas.Payments.Intent;

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
        serviceCollection.AddScoped<GetPaymentStatusHandler>();
        serviceCollection.AddScoped<CreatePaymentIntentHandler>();

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

            var authContext = request.GetAuthContext();

            using var scope = _serviceProvider.CreateScope();

            context.Logger.LogInformation($"HttpMethod: {request.HttpMethod?.ToUpperInvariant()}");
            context.Logger.LogInformation($"authContext: {JsonSerializer.Serialize(authContext)}");


            switch (request.HttpMethod?.ToUpperInvariant())
            {
                case "POST" when request.Path?.EndsWith("/webhook/stripe") == true:
                {
                    var handler = scope.ServiceProvider.GetRequiredService<StripeWebhookHandler>();
                    return await handler.HandleAsync(request);
                }
                case "POST":
                {
                    var handler = scope.ServiceProvider.GetRequiredService<CreatePaymentIntentHandler>();

                    var createPaymentRequest = JsonSerializationHelper.DeserializeFromFrontend<StripePaymentIntentRequestDto>(request.Body);
                    var command = new CreatePaymentIntentCommand(authContext, 
                            createPaymentRequest.Amount,
                            createPaymentRequest.Currency,
                            createPaymentRequest.GiftMetaData.GuestEmail,
                            createPaymentRequest.GiftMetaData
                        );

                    context.Logger.LogInformation($"POST Command: {System.Text.Json.JsonSerializer.Serialize(command)}");

                    var result = await handler.ExecuteAsync(command);

                    return result.OkResponse();
                        break;
                }
                case "GET:":
                {
                    var handler = scope.ServiceProvider.GetRequiredService<GetPaymentStatusHandler>();
                    throw new NotImplementedException("GET method is not implemented yet.");
                        break;
                }
                // context.Logger.LogInformation($"Raw Request Input: {request}");
                //
                // var authContext = request.GetAuthContext();
                // context.Logger.LogDebug($"Raw Auth Input: {authContext.GuestId} {authContext.InvitationCode} {authContext.Roles}");
                //
                // using var scope = _serviceProvider.CreateScope();
                // var handler = scope.ServiceProvider.GetRequiredService<GetStatsHandler>();
                //
                // var queryUnits = new GetStatsQuery(authContext);
                // var results = await handler.GetAsync(queryUnits);
                // return results.OkResponse();
                default:
                    return $"Unsupported HTTP method: {request.HttpMethod}".ErrorResponse((int)HttpStatusCode.MethodNotAllowed,
                        typeof(MissingMethodException).ToString());
            }
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
