using System;
using System.Net;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.FamilyUnit.Update.Commands;
using Wedding.Lambdas.FamilyUnit.Update.Handlers;

namespace Wedding.Lambdas.FamilyUnit.Update;

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
        serviceCollection.AddScoped<UpdateFamilyUnitHandler>();

        serviceCollection.AddSingleton<Lazy<Task<IUspsMailingAddressValidationProvider>>>(sp =>
        {
            return new Lazy<Task<IUspsMailingAddressValidationProvider>>(async () =>
            {
                var region = AwsRegionHelper.GetRegionEndpointFromEnvironment();
                var uspsConfig = await AwsParameterStoreHelper.GetParameterAsync<UspsConfiguration>("/usps/api/credentials", region);
                return new UspsMailingAddressValidationProvider(uspsConfig.ApiUrl, uspsConfig.ConsumerKey, uspsConfig.ConsumerSecret);
            });
        });

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

            var invitationCode = request.GetInvitationCodeFromAuthContext();
            var guestId = request.GetGuestIdFromAuthContext();
            var roles = request.GetRolesFromAuthContext();
            var familyUnitDto = JsonSerializationHelper.DeserializeFromFrontend<FamilyUnitDto>(request.Body);

            context.Logger.LogInformation($"invitationCode: {invitationCode}");
            context.Logger.LogInformation($"guestId: {guestId}");
            context.Logger.LogInformation($"roles: {roles}");

            var command = new UpdateFamilyUnitCommand(familyUnitDto, invitationCode, guestId, roles);

            if (command.FamilyUnit == null)
            {
                context.Logger.LogError("FamilyUnit is null.");
                throw new Exception("Invalid FamilyUnit in request.");
            }

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<UpdateFamilyUnitHandler>();
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
            var statusCode = (int)HttpStatusCode.BadRequest;
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
