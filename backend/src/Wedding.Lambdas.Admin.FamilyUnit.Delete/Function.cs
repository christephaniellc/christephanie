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
using Wedding.Common.Helpers.AWS.Frontend;
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
                throw new ValidationException("Invalid or missing InvitationCode in request.");
            }

            context.Logger.LogInformation($"invitationCode: {invitationCode}");

            var command = new DeleteFamilyUnitCommand(invitationCode);

            context.Logger.LogInformation($"Command: {System.Text.Json.JsonSerializer.Serialize(command)}");
            context.Logger.LogInformation($"FamilyUnit: {System.Text.Json.JsonSerializer.Serialize(command.InvitationCode)}");

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<DeleteFamilyUnitHandler>();
            var result = await handler.ExecuteAsync(command);
            var message = result ? $"Successfully deleted family unit <{invitationCode}>."
                : $"Error deleting family unit <{invitationCode}";
            
            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.OK,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = new FrontendApiResponse
                {
                    Data = JsonSerializer.SerializeToElement(message)
                }.ToBody()
            };
        }
        catch (ValidationException ex)
        {
            var statusCode = (int)HttpStatusCode.BadRequest;
            var error = $"Validation exception: {ex.Message}";
            context.Logger.LogError(error);

            return new APIGatewayProxyResponse
            {
                StatusCode = statusCode,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = new FrontendApiResponse
                {
                    Error = new FrontendApiError
                    {
                        Status = statusCode,
                        Error = typeof(UnauthorizedAccessException).ToString(),
                        Description = error
                    }
                }.ToBody()
            };
        }
        catch (Exception ex)
        {
            var statusCode = (int)HttpStatusCode.InternalServerError;
            var error = $"Error occurred: {ex.Message}";
            context.Logger.LogError(error);

            return new APIGatewayProxyResponse
            {
                StatusCode = statusCode,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = new FrontendApiResponse
                {
                    Error = new FrontendApiError
                    {
                        Status = statusCode,
                        Error = typeof(UnauthorizedAccessException).ToString(),
                        Description = error
                    }
                }.ToBody()
            };
        }
    }
}
