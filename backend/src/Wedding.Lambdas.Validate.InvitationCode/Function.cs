using System;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Abstractions.Dtos;
using Wedding.Common.DI;
using Wedding.Lambdas.FamilyUnit.Get;
using Wedding.Lambdas.Validate.InvitationCode.Commands;
using Wedding.Lambdas.Validate.InvitationCode.Handlers;

namespace Wedding.Lambdas.Validate.InvitationCode;

public class Function
{
    private readonly ServiceProvider _serviceProvider;

    public Function()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));
        serviceCollection.AddScoped<GetGuestByInvitationCodeHandler>();

        _serviceProvider = serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Validates invitation code and first name
    /// </summary>
    /// <param name="command">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<GuestDto?> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {request.Body}");

            if (!request.PathParameters.TryGetValue("invitationCode", out var invitationCode) || string.IsNullOrEmpty(invitationCode))
            {
                context.Logger.LogError("InvitationCode is missing or invalid in PathParameters.");
                throw new Exception("Invalid or missing InvitationCode in request.");
            }

            context.Logger.LogInformation($"rsvpCode: {invitationCode}");

            if (!request.PathParameters.TryGetValue("firstName", out var firstName) || string.IsNullOrEmpty(firstName))
            {
                context.Logger.LogError("FirstName is missing or invalid in PathParameters.");
                throw new Exception("Invalid or missing FirstName in request.");
            }

            var command = new GetGuestByInvitationCodeQuery(invitationCode, firstName);

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<GetGuestByInvitationCodeHandler>();
            return await handler.GetAsync(command);
        }
        catch (ValidationException ex)
        {
            context.Logger.LogError($"Validation exception: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"Error occurred: {ex.Message}");
            throw;
        }
    }
}
