using Amazon.Lambda.Core;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using FluentValidation;
using Wedding.Common.DI;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Handlers;
using Wedding.Common.Serialization;
using Wedding.Common.Helpers.AWS.Frontend;
using System.Text.Json;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create;

public class Function
{
    private readonly ServiceProvider _serviceProvider;

    public Function()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));
        serviceCollection.AddScoped<CreateFamilyUnitHandler>();

        _serviceProvider = serviceCollection.BuildServiceProvider();
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
            // TODO auth layer
            context.Logger.LogInformation($"Raw Input: {request.Body}");

            var command = JsonSerializationHelper.DeserializeCommand<CreateFamilyUnitCommand>(request.Body);

            if (command.FamilyUnit == null)
            {
                context.Logger.LogError("FamilyUnit is null.");
                throw new Exception("Invalid FamilyUnit in request.");
            }

            context.Logger.LogInformation($"Command: {System.Text.Json.JsonSerializer.Serialize(command)}");
            context.Logger.LogInformation(
                $"FamilyUnit: {System.Text.Json.JsonSerializer.Serialize(command.FamilyUnit)}");

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<CreateFamilyUnitHandler>();

            var result = await handler.ExecuteAsync(command);

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
                    Data = JsonSerializer.SerializeToElement(result)
                }.ToBody()
            };
        }
        catch (UnauthorizedAccessException ex)
        {
            var statusCode = (int)HttpStatusCode.Unauthorized;
            var error = $"Authorization exception: {ex.Message}";
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
        catch (ValidationException ex)
        {
            var statusCode = (int)HttpStatusCode.BadRequest;
            var exception = $"Validation exception: {ex.Message}";
            context.Logger.LogError(exception);

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
                        Error = typeof(ValidationException).ToString(),
                        Description = exception
                    }
                }.ToBody()
            };
        }
        catch (Exception ex)
        {
            var statusCode = (int)HttpStatusCode.InternalServerError;
            var exception = $"Error occurred: {ex.Message}";
            context.Logger.LogError(exception);

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
                        Error = typeof(Exception).ToString(),
                        Description = exception
                    }
                }.ToBody()
            };
        }
    }
}
