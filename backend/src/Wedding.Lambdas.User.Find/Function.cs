using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Multitenancy;
using Wedding.Lambdas.User.Find.Commands;
using Wedding.Lambdas.User.Find.Handlers;

namespace Wedding.Lambdas.User.Find;

public class Function
{
    private readonly ServiceProvider _serviceProvider;
    private Dictionary<string, string>? _metaData { get; set; }

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
        serviceCollection.AddScoped<FindUserHandler>();

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
            FindUserQuery query;
            context.Logger.LogInformation($"Raw Query Input: {JsonSerializer.Serialize(request.QueryStringParameters)}");
            context.Logger.LogInformation($"Headers count: {request.Headers.Count}");
            context.Logger.LogInformation($"Headers: {JsonSerializer.Serialize(request.Headers)}");
            foreach (var header in request.Headers)
            {
                context.Logger.LogDebug($"Header: {header.Key}: {header.Value}");
            }

            var invitationCode = request.GetInvitationCodeFromParams();
            var firstName = request.GetFirstNameFromParams();
            var origin = request.GetOriginFromRequest();
            var originAudience = request.GetOriginFromRequest();

            _metaData = new Dictionary<string, string>
            {
                {"origin", origin ?? "unknown"},
                {"originAudience", originAudience ?? "unknown"},
                {"invitationCode", invitationCode ?? "unknown"},
                {"firstName", firstName ?? "unknown"}
            };

            if (string.IsNullOrEmpty(originAudience) || string.IsNullOrEmpty(origin))
            {
                var viewError = $"This request looks shifty.";
                var logError = $"Audience exception: audience empty.";
                context.Logger.LogError(logError);

                return viewError.ErrorResponse((int)HttpStatusCode.BadRequest, typeof(ValidationException).ToString(), _metaData);
            }

            using var scope = _serviceProvider.CreateScope();
            var multitenancySettingsProvider = scope.ServiceProvider.GetRequiredService<IMultitenancySettingsProvider>();
            var mappedAudience = multitenancySettingsProvider.GetMappedAudience(origin) ?? throw new InvalidOperationException();

            context.Logger.LogInformation($"Query Input: {invitationCode} {firstName}");

            query = new FindUserQuery(mappedAudience, invitationCode ?? string.Empty, firstName ?? string.Empty);
            
            var handler = scope.ServiceProvider.GetRequiredService<FindUserHandler>();
            var result = await handler.GetAsync(query);

            return result.OkResponse();
        }
        catch (ValidationException ex)
        {
            var viewError = $"Invitation not found. Please contact your hosts to resolve.";
            var logError = $"Validation exception: {ex.Message}";
            context.Logger.LogError(logError);

            return viewError.ErrorResponse((int)HttpStatusCode.BadRequest, typeof(ValidationException).ToString(), _metaData);
        }
        catch (KeyNotFoundException ex)
        {
            var viewError = $"Invitation not found. Please contact your hosts to resolve.";
            var error = $"KeyNotFoundException exception: {ex.Message}";
            context.Logger.LogError(error);

            return viewError.ErrorResponse((int)HttpStatusCode.NotFound, typeof(KeyNotFoundException).ToString(), _metaData);
        }
        catch (Exception ex)
        {
            var viewError = $"Application exception. Please contact your hosts to resolve.";
            var logError = $"Error occurred: {ex.Message}";
            context.Logger.LogError(logError);

            return viewError.ErrorResponse((int)HttpStatusCode.InternalServerError, typeof(Exception).ToString(), _metaData);
        }
    }
}
