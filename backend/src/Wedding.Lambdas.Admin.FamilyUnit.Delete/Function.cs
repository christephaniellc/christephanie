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
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Handlers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Delete;

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
        serviceCollection.AddScoped<AdminDeleteFamilyUnitHandler>();

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
            context.Logger.LogInformation($"Raw Input: {JsonSerializer.Serialize(request.PathParameters)}");

            if (!request.PathParameters.TryGetValue("invitationCode", out var invitationCode) || string.IsNullOrEmpty(invitationCode))
            {
                throw new ValidationException("Invalid or missing InvitationCode in request.");
            }

            var authContext = request.GetAuthContext();

            context.Logger.LogInformation($"invitationCode: {invitationCode}");

            var command = new AdminDeleteFamilyUnitCommand(invitationCode, authContext);

            context.Logger.LogInformation($"Command: {JsonSerializer.Serialize(command)}");
            context.Logger.LogInformation($"FamilyUnit: {JsonSerializer.Serialize(command.InvitationCode)}");

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<AdminDeleteFamilyUnitHandler>();
            var result = await handler.ExecuteAsync(command);
            var message = result ? $"Successfully deleted family unit <{invitationCode}>."
                : $"Error deleting family unit <{invitationCode}";

            return message.OkResponse();
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
