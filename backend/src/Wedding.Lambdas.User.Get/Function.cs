using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Abstractions.Enums;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.User.Get.Commands;
using Wedding.Lambdas.User.Get.Handlers;

namespace Wedding.Lambdas.User.Get;

public class Function
{
    private readonly ServiceProvider _serviceProvider;

    public Function()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));
        serviceCollection.AddScoped<GetUserHandler>();

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
            GetUserQuery query;
            context.Logger.LogInformation($"Raw Query Input (should be empty): {request.QueryStringParameters}");

            var userId = request.GetUserId();
            var invitationCode = request.GetInvitationCode();
            var roles = request.GetRoles();

            context.Logger.LogInformation($"Raw Auth Input: {userId} {invitationCode} {string.Join(",", roles)}");

            query = new GetUserQuery(userId, invitationCode, roles);
            // }
            // catch (NullReferenceException ex)
            // {
            //     var error = $"UserId is missing or invalid.";
            //     context.Logger.LogError(error);
            //
            //     return new APIGatewayProxyResponse
            //     {
            //         StatusCode = (int)HttpStatusCode.BadRequest,
            //         IsBase64Encoded = false,
            //         Headers = new Dictionary<string, string>
            //         {
            //             { "Content-Type", "application/json" }
            //         },
            //         Body = JsonSerializer.Serialize(error)
            //     };
            //
            // }
            // catch (ArgumentNullException ex) 
            // {
            //     var error = $"{ex.ParamName} is missing or invalid in QueryStringParameters.";
            //     context.Logger.LogError(error);
            //
            //     return new APIGatewayProxyResponse
            //     {
            //         StatusCode = (int)HttpStatusCode.BadRequest,
            //         IsBase64Encoded = false,
            //         Headers = new Dictionary<string, string>
            //         {
            //             { "Content-Type", "application/json" }
            //         },
            //         Body = JsonSerializer.Serialize(error)
            //     };
            // }
            
            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<GetUserHandler>();
            var result = await handler.GetAsync(query);
            
            return new APIGatewayProxyResponse
            {
                StatusCode = (int) HttpStatusCode.OK,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = JsonSerializer.Serialize(result)
            };
        }
        catch (UnauthorizedAccessException ex)
        {
            var error = $"Authorization exception: {ex.Message}";
            context.Logger.LogError(error);

            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.Unauthorized,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = JsonSerializer.Serialize(error)
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
