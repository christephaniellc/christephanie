using System;
using System.Net;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Lambdas.FamilyUnit.Patch.Commands;
using Wedding.Lambdas.FamilyUnit.Patch.Handlers;
using Wedding.Lambdas.FamilyUnit.Patch.Requests;

namespace Wedding.Lambdas.FamilyUnit.Patch;

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
        serviceCollection.AddScoped<PatchFamilyUnitHandler>();

        return serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Admin function that creates a family unit
    /// </summary>
    /// <param name="request">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {request.Body}");
            var patchRequest = JsonSerializationHelper.DeserializeFromFrontend<PatchFamilyUnitRequest>(request.Body);

            var authContext = request.GetAuthContext();
            context.Logger.LogInformation($"invitationCode: {authContext.InvitationCode}");
            context.Logger.LogInformation($"guestId: {authContext.GuestId}");
            context.Logger.LogInformation($"roles: {authContext.Roles}");

            var command = new PatchFamilyUnitCommand(authContext, patchRequest.MailingAddress, patchRequest.InvitationResponseNotes);

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<PatchFamilyUnitHandler>();
            var result = await handler.ExecuteAsync(command);

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
