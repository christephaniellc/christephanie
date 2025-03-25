using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.SimpleNotificationService.Model;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Abstractions.Dtos;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Lambdas.Admin.Configuration.Invitation.Commands;
using Wedding.Lambdas.Admin.Configuration.Invitation.Handlers;
using ValidationException = FluentValidation.ValidationException;

namespace Wedding.Lambdas.Admin.Configuration.Invitation;

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
        serviceCollection.AddScoped<AdminConfigurationInvitationHandler>();

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
            context.Logger.LogInformation($"Raw Request Input: {JsonSerializer.Serialize(request)}");
            context.Logger.LogInformation($"Raw QueryString Input: {JsonSerializer.Serialize(request.QueryStringParameters)}");
            context.Logger.LogInformation($"Raw Input: {JsonSerializer.Serialize(request.Body)}");
            
            var designId = request.GetDesignIdFromParams();
            var authContext = request.GetAuthContext();
            context.Logger.LogDebug($"Raw Auth Input: {authContext.GuestId} {authContext.InvitationCode} {authContext.Roles}");
            context.Logger.LogInformation($"DesignId: {designId}");

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<AdminConfigurationInvitationHandler>();

            switch (request.HttpMethod?.ToUpperInvariant())
            {
                case "POST":
                    if (string.IsNullOrWhiteSpace(request.Body))
                        return "Request body is required.".ErrorResponse((int)HttpStatusCode.BadRequest, typeof(InvalidParameterException).ToString());

                    var saveDto = JsonSerializationHelper.DeserializeFromFrontend<InvitationDesignDto>(request.Body);
                    if (saveDto == null)
                        return "Invalid design configuration.".ErrorResponse((int)HttpStatusCode.BadRequest, typeof(InvalidParameterException).ToString());

                    var saveCommand = new AdminSavePhotoConfigurationCommand(authContext, saveDto);
                    var saveResult = await handler.ExecuteAsync(saveCommand);
                    return saveResult.OkResponse();

                case "GET":
                    if (string.IsNullOrEmpty(designId))
                    {
                        var getAllQuery = new AdminGetPhotoConfigurationsQuery(authContext);
                        var getAllResult = await handler.GetAsync(getAllQuery);
                        return getAllResult.OkResponse();
                    }
                    else
                    {
                        var getOneQuery = new AdminGetPhotoConfigurationQuery(authContext, designId);
                        var getOneResult = await handler.GetAsync(getOneQuery);
                        return getOneResult.OkResponse();
                    }

                case "DELETE":
                    if (string.IsNullOrEmpty(designId))
                    {
                        return $"Design ID is required to delete a configuration"
                            .ErrorResponse((int)HttpStatusCode.BadRequest, typeof(InvalidParameterValueException).ToString());
                    }

                    var deleteCommand = new AdminDeletePhotoConfigurationCommand(authContext, designId);
                    await handler.ExecuteAsync(deleteCommand);
                    return new APIGatewayProxyResponse { StatusCode = (int)HttpStatusCode.NoContent };

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
