using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Multitenancy;
using Wedding.Lambdas.Verify.Email.Commands;
using Wedding.Lambdas.Verify.Email.Handlers;

namespace Wedding.Lambdas.Verify.Email;

public class Function
{
    private readonly ServiceProvider _serviceProvider;
    private Dictionary<string, string>? _metaData { get; set; }
    private static string _authority = "";
    private static string _audience = "";

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
        serviceCollection.AddScoped<VerifyEmailHandler>();
        serviceCollection.AddScoped<IAwsParameterCacheProvider, AwsParameterCacheProvider>();

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
            context.Logger.LogInformation($"Raw VerifyEmail Input: {JsonSerializer.Serialize(request)}");
            context.Logger.LogInformation($"Raw QueryString Input: {JsonSerializer.Serialize(request.QueryStringParameters)}");
            context.Logger.LogInformation($"Raw Input Body: {JsonSerializer.Serialize(request.Body)}");

            var token = request.GetVerifyTokenFromParams();
            var origin = request.GetOriginFromRequest();
            var originAudience = request.GetOriginFromRequest();
            
            // Handle OPTIONS preflight request for CORS
            if (request.HttpMethod?.ToUpper() == "OPTIONS")
            {
                context.Logger.LogInformation("Handling OPTIONS preflight request for CORS");
                
                return new APIGatewayProxyResponse
                {
                    StatusCode = 204, // No Content is standard for OPTIONS
                    Headers = AwsGatewayProxyResponseExtensions.GetCorsHeaders(origin),
                    Body = string.Empty,
                    IsBase64Encoded = false
                };
            }

            _metaData = new Dictionary<string, string>
            {
                {"origin", origin ?? "unknown"},
                {"originAudience", originAudience ?? "unknown"},
                {"token", token ?? "unknown"},
            };

            if (string.IsNullOrEmpty(originAudience) || string.IsNullOrEmpty(origin))
            {
                var viewError = $"This request looks shifty.";
                var logError = $"Audience exception: audience empty.";
                context.Logger.LogError(logError);

                // Include origin for CORS headers
                return viewError.ErrorResponse((int)HttpStatusCode.BadRequest, typeof(ValidationException).ToString(), _metaData, origin);
            }

            using var scope = _serviceProvider.CreateScope();

            if (string.IsNullOrEmpty(_authority))
            {
                var authConfig = await AwsParameterCache.GetConfigAsync<Auth0Configuration>();
                _authority = authConfig.Authority ?? throw new InvalidOperationException();
            }
            if (string.IsNullOrEmpty(_audience))
            {
                var multitenancySettingsProvider = scope.ServiceProvider.GetRequiredService<IMultitenancySettingsProvider>();
                if (string.IsNullOrEmpty(origin))
                {
                    throw new ApplicationException("Unable to determine origin.");
                }
                _audience = multitenancySettingsProvider.GetMappedAudience(origin) ?? throw new InvalidOperationException();
            }

            context.Logger.LogInformation($"Query Input: {token}");

            var command = new VerifyEmailCommand(_authority, _audience, token);
            
            var handler = scope.ServiceProvider.GetRequiredService<VerifyEmailHandler>();
            var result = await handler.GetAsync(command);

            // Pass the origin to ensure proper CORS headers
            return result.OkResponse(origin);
        }
        catch (ValidationException ex)
        {
            var viewError = $"Validation failed.";
            var logError = $"Validation exception: {ex.Message}";
            context.Logger.LogError(logError);

            // Get origin from metadata if available
            string? origin = _metaData?.ContainsKey("origin") == true ? _metaData["origin"] : null;
            return viewError.ErrorResponse((int)HttpStatusCode.BadRequest, typeof(ValidationException).ToString(), _metaData, origin);
        }
        catch (KeyNotFoundException ex)
        {
            var viewError = $"Validation failed.";
            var error = $"KeyNotFoundException exception: {ex.Message}";
            context.Logger.LogError(error);

            // Get origin from metadata if available
            string? origin = _metaData?.ContainsKey("origin") == true ? _metaData["origin"] : null;
            return viewError.ErrorResponse((int)HttpStatusCode.NotFound, typeof(KeyNotFoundException).ToString(), _metaData, origin);
        }
        catch (Exception ex)
        {
            var viewError = $"Application exception. Please contact your hosts to resolve.";
            var logError = $"Error occurred: {ex.Message}";
            context.Logger.LogError(logError);

            // Get origin from metadata if available
            string? origin = _metaData?.ContainsKey("origin") == true ? _metaData["origin"] : null;
            return viewError.ErrorResponse((int)HttpStatusCode.InternalServerError, typeof(Exception).ToString(), _metaData, origin);
        }
    }
}
