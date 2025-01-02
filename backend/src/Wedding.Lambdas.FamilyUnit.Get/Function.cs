using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.FamilyUnit.Get.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Handlers;

namespace Wedding.Lambdas.FamilyUnit.Get;

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
        serviceCollection.AddScoped<GetFamilyUnitHandler>();

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
            GetFamilyUnitQuery query;
            context.Logger.LogInformation($"Raw Request Context: {JsonSerializer.Serialize(request)}");
            context.Logger.LogInformation($"Raw Lambda Context: {JsonSerializer.Serialize(context)}");

            var invitationCode = request.GetInvitationCodeFromAuthContext();
            var guestId = request.GetGuestIdFromAuthContext();
            var roles = request.GetRolesFromAuthContext();

            context.Logger.LogInformation($"invitationCode: {invitationCode}");
            context.Logger.LogInformation($"guestId: {guestId}");
            context.Logger.LogInformation($"roles: {roles}");

            query = new GetFamilyUnitQuery(invitationCode, guestId, roles);
            
            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<GetFamilyUnitHandler>();
            var result = await handler.GetAsync(query);

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
