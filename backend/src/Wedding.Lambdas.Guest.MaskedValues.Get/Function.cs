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
using Wedding.Lambdas.Guest.MaskedValues.Get.Commands;
using Wedding.Lambdas.Guest.MaskedValues.Get.Handlers;
using Wedding.Lambdas.Guest.MaskedValues.Get.Requests;
using Wedding.Lambdas.Guest.MaskedValues.Get.Validation;

namespace Wedding.Lambdas.Guest.MaskedValues.Get;

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
        serviceCollection.AddScoped<GetGuestMaskedValueHandler>();

        return serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Gets guest object masked values
    /// </summary>
    /// <param name="request">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {request.Body}");
            var getRequest = JsonSerializationHelper.DeserializeFromFrontend<GetGuestMaskedValuesRequest>(request.Body);

            var authContext = request.GetAuthContext();
            context.Logger.LogInformation($"invitationCode: {authContext.InvitationCode}");
            context.Logger.LogInformation($"guestId: {authContext.GuestId}");
            context.Logger.LogInformation($"roles: {authContext.Roles}");
            
            getRequest!.Validate(nameof(getRequest));

            var command = new GetMaskedValueCommand(
                authContext, 
                getRequest.GuestId,
                getRequest.MaskedValueType
                );;

            if (string.IsNullOrEmpty(command.GuestId))
            {
                context.Logger.LogError("GuestId is null.");
                throw new Exception("Invalid GuestId in request.");
            }

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<GetGuestMaskedValueHandler>();
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
