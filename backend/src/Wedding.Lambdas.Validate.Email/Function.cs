using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.SimpleSystemsManagement.Model;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Abstractions.Enums;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.JwtClaim;
using Wedding.Common.Serialization;
using Wedding.Lambdas.Validate.Email.Commands;
using Wedding.Lambdas.Validate.Email.Handlers;
using Wedding.Lambdas.Validate.Email.Requests;
using Wedding.Lambdas.Validate.Email.Validation;
using ValidationException = FluentValidation.ValidationException;

namespace Wedding.Lambdas.Validate.Email;

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
        serviceCollection.AddScoped<EmailValidationHandler>();
        serviceCollection.AddScoped<IAwsParameterCacheProvider, AwsParameterCacheProvider>();

        serviceCollection.AddSingleton<Lazy<Task<IAwsSesHelper>>>(sp =>
        {
            return new Lazy<Task<IAwsSesHelper>>(async () =>
            {
                 //var logger = sp.GetRequiredService<ILogger<IAwsSesHelper>>();
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
    /// Registers or validates an email, or resends code
    /// </summary>
    /// <param name="request">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {request}");

            // Check for null body
            if (string.IsNullOrEmpty(request.Body))
            {
                // Check if this is a token validation request (coming from a link click)
                string? token = null;
                
                // Try to get token from query parameters
                if (request.QueryStringParameters != null && 
                    request.QueryStringParameters.TryGetValue("token", out var tokenFromQuery))
                {
                    token = tokenFromQuery;
                    context.Logger.LogInformation($"Found token in query params: {token}");
                }
                
                // If we found a token, process as a token validation request
                if (!string.IsNullOrEmpty(token))
                {
                    using var tokenScope = _serviceProvider.CreateScope();
                    var tokenHandler = tokenScope.ServiceProvider.GetRequiredService<EmailValidationHandler>();
                    
                    var command = new ValidateEmailTokenCommand(token);
                    var result = await tokenHandler.ExecuteAsync(command);
                    return result.OkResponse();
                }
                
                // Otherwise, this is an invalid request
                throw new ValidationException("Request body cannot be null or empty");
            }
            
            var authContext = request.GetAuthContext();

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<EmailValidationHandler>();
            
            var emailRequest = JsonSerializationHelper.DeserializeFromFrontend<ValidateEmailRequest>(request.Body);
            context.Logger.LogInformation($"Deserialized Input: {JsonSerializer.Serialize(emailRequest)}");

            emailRequest.Validate(nameof(emailRequest));

            if (emailRequest.Action == VerifyEnum.Register)
            {
                var command = new RegisterEmailCommand(authContext, emailRequest.Email ?? string.Empty);
                var result = await handler.ExecuteAsync(command);
                return result.OkResponse();
            }

            if (emailRequest.Action == VerifyEnum.Validate)
            {
                if (!string.IsNullOrEmpty(emailRequest.Token))
                {
                    var command = new ValidateEmailTokenCommand(emailRequest.Token);
                    var result = await handler.ExecuteAsync(command);
                    return result.OkResponse();
                }
                else
                {
                    var command = new ValidateEmailCommand(authContext, emailRequest.Code ?? string.Empty);
                    var result = await handler.ExecuteAsync(command);
                    return result.OkResponse();
                }
            }

            // Otherwise, resend code
            var resend = new ResendEmailCodeCommand(authContext);
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
