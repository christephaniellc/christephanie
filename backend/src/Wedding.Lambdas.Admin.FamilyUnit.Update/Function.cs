using System;
using System.Net;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Abstractions.Dtos;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;
using ValidationException = FluentValidation.ValidationException;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update;

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
        serviceCollection.AddScoped<AdminUpdateFamilyUnitHandler>();

        return serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Admin function that updates a family unit
    /// </summary>
    /// <param name="request">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {System.Text.Json.JsonSerializer.Serialize(request)}");

            var authContext = request.GetAuthContext();

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<AdminUpdateFamilyUnitHandler>();

            context.Logger.LogInformation($"HttpMethod: {request.HttpMethod?.ToUpperInvariant()}");


            switch (request.HttpMethod?.ToUpperInvariant())
            {
                case "POST":
                {
                    var familyUnit = JsonSerializationHelper.DeserializeFromFrontend<FamilyUnitDto>(request.Body);
                    var command = new AdminUpdateFamilyUnitCommand(familyUnit, authContext);

                    context.Logger.LogInformation($"POST Command: {System.Text.Json.JsonSerializer.Serialize(command)}");
                    context.Logger.LogInformation($"FamilyUnit: {System.Text.Json.JsonSerializer.Serialize(command.FamilyUnit)}");

                    if (command.FamilyUnit == null)
                    {
                        throw new ValidationException("Invalid FamilyUnit in request.");
                    }

                    var result = await handler.ExecuteAsync(command);

                    return result.OkResponse();
                    break;
                }
                case "PATCH":
                {
                    var familyPatchRequest = JsonSerializationHelper.DeserializeFromFrontend<AdminPatchGuestRequest>(request.Body);
                    var command = new AdminPatchGuestCommand(authContext, 
                        familyPatchRequest.InvitationCode,
                        familyPatchRequest.GuestId, 
                        familyPatchRequest.Email, 
                        familyPatchRequest.Phone, 
                        familyPatchRequest.InvitationResponse, 
                        familyPatchRequest.Wedding);

                    context.Logger.LogInformation($"PATCH Command: {System.Text.Json.JsonSerializer.Serialize(command)}");

                    var result = await handler.ExecuteAsync(command);

                    return result.OkResponse();
                    break;
                    }
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
