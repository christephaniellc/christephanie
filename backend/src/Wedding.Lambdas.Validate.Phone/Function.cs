using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.SimpleSystemsManagement.Model;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Enums;
using Wedding.Common.Configuration;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Validate.Phone.Commands;
using Wedding.Lambdas.Validate.Phone.Handlers;
using Wedding.Lambdas.Validate.Phone.Requests;
using Wedding.Lambdas.Validate.Phone.Validation;
using ValidationException = FluentValidation.ValidationException;

namespace Wedding.Lambdas.Validate.Phone;

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
        serviceCollection.AddScoped<PhoneValidationHandler>();
        
        serviceCollection.AddSingleton<Lazy<Task<ITwilioSmsProvider>>>(sp =>
        {
            return new Lazy<Task<ITwilioSmsProvider>>(async () =>
            {
                var logger = sp.GetRequiredService<ILogger<TwilioSmsProvider>>();
                var config = await AwsParameterCache.GetConfigAsync<TwilioSmsConfiguration>();
                return new TwilioSmsProvider(logger, config);
            });
        });

        serviceCollection.AddScoped<ITwilioSmsProvider>(sp =>
        {
            var lazyProvider = sp.GetRequiredService<Lazy<Task<ITwilioSmsProvider>>>();
            return lazyProvider.Value.GetAwaiter().GetResult();
        });

        return serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Registers or validates a phone number, or resends code
    /// </summary>
    /// <param name="request">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {JsonSerializer.Serialize(request.Body)}");

            var authContext = request.GetAuthContext();

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<PhoneValidationHandler>();
            
            var phoneRequest = JsonSerializationHelper.DeserializeFromFrontend<ValidatePhoneRequest>(request.Body);
            context.Logger.LogInformation($"Deserialized Input: {JsonSerializer.Serialize(phoneRequest)}");

            phoneRequest.Validate(nameof(phoneRequest));

            if (phoneRequest.Action == VerifyEnum.Register)
            {
                var command = new RegisterPhoneCommand(authContext, phoneRequest.PhoneNumber ?? string.Empty);
                var result = await handler.ExecuteAsync(command);
                return result.OkResponse();
            }

            if (phoneRequest.Action == VerifyEnum.Validate)
            {
                var command = new ValidatePhoneCommand(authContext, phoneRequest.Code ?? string.Empty);
                var result = await handler.ExecuteAsync(command);
                return result.OkResponse();
            }

            // Otherwise, resend code
            var resend = new ResendPhoneCodeCommand(authContext);
            var resendResult = await handler.ExecuteAsync(resend);
            return resendResult.OkResponse();
        }
        catch (TooManyUpdatesException ex)
        {
            var error = $"Too many requests exception: {ex.Message}";
            context.Logger.LogError(error);

            return error.ErrorResponse((int)HttpStatusCode.TooManyRequests, typeof(TooManyUpdatesException).ToString());
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
