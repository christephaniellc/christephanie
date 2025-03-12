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
using Wedding.Common.Serialization;
using Wedding.Lambdas.User.Patch.Commands;
using Wedding.Lambdas.User.Patch.Handlers;
using Wedding.Lambdas.User.Patch.Validation;

namespace Wedding.Lambdas.User.Patch;

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
        serviceCollection.AddScoped<PatchUserHandler>();

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
            PatchUserCommand query;
            context.Logger.LogInformation($"Raw Query Input: {JsonSerializer.Serialize(request.QueryStringParameters)}");

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
            
            context.Logger.LogInformation($"Raw Input: {request.Body}");
            var patchRequest = JsonSerializationHelper.DeserializeFromFrontend<PatchUserRequest>(request.Body);

            var authContext = request.GetAuthContext();
            context.Logger.LogInformation($"invitationCode: {authContext.InvitationCode}");
            context.Logger.LogInformation($"guestId: {authContext.GuestId}");
            context.Logger.LogInformation($"roles: {authContext.Roles}");

            patchRequest!.Validate(nameof(patchRequest));

            var command = new PatchUserCommand(
                authContext,
                patchRequest.ClientInfo
            );

            using var scope = _serviceProvider.CreateScope();

            context.Logger.LogInformation($"Raw Auth Input: {authContext.GuestId} {authContext.InvitationCode} {authContext.Roles}");
            
            var handler = scope.ServiceProvider.GetRequiredService<PatchUserHandler>();
            var result = await handler.ExecuteAsync(command);

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
