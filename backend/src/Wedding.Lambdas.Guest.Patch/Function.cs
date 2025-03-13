using System;
using System.Net;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Wedding.Common.Configuration;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Guest.Patch.Commands;
using Wedding.Lambdas.Guest.Patch.Handlers;
using Wedding.Lambdas.Guest.Patch.Requests;
using Wedding.Lambdas.Guest.Patch.Validation;

namespace Wedding.Lambdas.Guest.Patch;

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
        serviceCollection.AddScoped<PatchGuestHandler>();

        serviceCollection.AddSingleton<Lazy<Task<IUspsMailingAddressValidationProvider>>>(sp =>
        {
            return new Lazy<Task<IUspsMailingAddressValidationProvider>>(async () =>
            {
                var logger = sp.GetRequiredService<ILogger<UspsMailingAddressValidationProvider>>();
                var uspsConfig = await AwsParameterCache.GetConfigAsync<UspsConfiguration>();
                return new UspsMailingAddressValidationProvider(logger, uspsConfig.ApiUrl, uspsConfig.ConsumerKey, uspsConfig.ConsumerSecret);
            });
        });

        return serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Patches guest object
    /// </summary>
    /// <param name="request">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {request.Body}");
            var patchRequest = JsonSerializationHelper.DeserializeFromFrontend<PatchGuestRequest>(request.Body);

            var authContext = request.GetAuthContext();
            context.Logger.LogInformation($"invitationCode: {authContext.InvitationCode}");
            context.Logger.LogInformation($"guestId: {authContext.GuestId}");
            context.Logger.LogInformation($"roles: {authContext.Roles}");
            
            patchRequest!.Validate(nameof(patchRequest));

            var command = new PatchGuestCommand(
                authContext, 
                patchRequest.GuestId,
                patchRequest.AgeGroup, 
                patchRequest.Auth0Id, 
                patchRequest.Email, 
                patchRequest.Phone, 
                patchRequest.InvitationResponse,
                patchRequest.RehearsalDinner,
                patchRequest.FourthOfJuly,
                patchRequest.Wedding,
                patchRequest.RsvpNotes,
                patchRequest.NotificationPreference,
                patchRequest.SleepPreference,
                patchRequest.FoodPreference,
                patchRequest.FoodAllergies,
                patchRequest.AllowBetaScreenRecordings
                );

            if (string.IsNullOrEmpty(command.GuestId))
            {
                context.Logger.LogError("GuestId is null.");
                throw new Exception("Invalid GuestId in request.");
            }

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<PatchGuestHandler>();
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
