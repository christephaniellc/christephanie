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
        serviceCollection.AddScoped<DeleteFamilyUnitHandler>();

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
                var error = "Invalid or missing InvitationCode in request.";
                context.Logger.LogError(error);

                return new APIGatewayProxyResponse
                {
                    StatusCode = (int) HttpStatusCode.BadRequest,
                    IsBase64Encoded = false,
                    Headers = new Dictionary<string, string>
                    {
                        { "Content-Type", "application/json" }
                    },
                    Body = JsonSerializer.Serialize(error)
                };
            }

            context.Logger.LogInformation($"invitationCode: {invitationCode}");

            var command = new DeleteFamilyUnitCommand(invitationCode);

            context.Logger.LogInformation($"Command: {System.Text.Json.JsonSerializer.Serialize(command)}");
            context.Logger.LogInformation($"FamilyUnit: {System.Text.Json.JsonSerializer.Serialize(command.InvitationCode)}");

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<DeleteFamilyUnitHandler>();
            var result = await handler.ExecuteAsync(command);
            
            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.OK,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = JsonSerializer.Serialize(result ? $"Successfully deleted family unit <{invitationCode}>." 
                    : $"Error deleting family unit <{invitationCode}")
            };
        }
        catch (ValidationException ex)
        {
            var error = $"Validation exception: {ex.Message}";
            context.Logger.LogError(error);

            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.BadRequest,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = JsonSerializer.Serialize(error)
            };
        }
        catch (Exception ex)
        {
            var error = $"Error occurred: {ex.Message}";
            context.Logger.LogError(error);

            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.InternalServerError,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = JsonSerializer.Serialize(error)
            };
        }
    }
}
