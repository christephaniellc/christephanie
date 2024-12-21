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
    /// <param name="request">The request event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Query Params: {JsonSerializer.Serialize(request.QueryStringParameters)}");
            context.Logger.LogInformation($"Raw Input: {JsonSerializer.Serialize(request.Body)}");

            if (!request.QueryStringParameters.TryGetValue("invitationCode", out var invitationCode) || string.IsNullOrEmpty(invitationCode))
            {
                var error = "Invalid or missing InvitationCode in request.";
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

            context.Logger.LogInformation($"invitationCode: {invitationCode}");

            if (!request.QueryStringParameters.TryGetValue("firstName", out var firstName) || string.IsNullOrEmpty(firstName))
            {
                var error = "Invalid or missing FirstName in request.";
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

            context.Logger.LogInformation($"firstName: {firstName}");

            var command = new GetGuestByInvitationCodeQuery(invitationCode, firstName);

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<GetGuestByInvitationCodeHandler>();
            var result = await handler.GetAsync(command);
            
            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.OK,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = JsonSerializer.Serialize(result)
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
