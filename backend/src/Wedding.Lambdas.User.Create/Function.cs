// using System;
// using System.Collections.Generic;
// using System.Net;
// using System.Text.Json;
// using System.Threading.Tasks;
// using Amazon.Lambda.APIGatewayEvents;
// using Amazon.Lambda.Core;
// using FluentValidation;
// using Microsoft.Extensions.DependencyInjection;
// using Wedding.Common.DI;
// using Wedding.Common.Serialization;
// using Wedding.Lambdas.User.Create.Commands;
// using Wedding.Lambdas.User.Create.Handlers;
//
// namespace Wedding.Lambdas.User.Create;
//
// public class Function
// {
//     private readonly ServiceProvider _serviceProvider;
//     private readonly 
//
//     public Function()
//     {
//         var serviceCollection = new ServiceCollection();
//
//         serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));
//         serviceCollection.AddScoped<CreateUserHandler>();
//
//         _serviceProvider = serviceCollection.BuildServiceProvider();
//     }
//
//     /// <summary>
//     /// Admin function that creates a family unit
//     /// </summary>
//     /// <param name="request">The request event for the Lambda function handler to process.</param>
//     /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
//     /// <returns></returns>
//     public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
//     {
//         try
//         {
//             context.Logger.LogInformation($"Raw Input: {request.Body}");
//
//             var userId = request.RequestContext.Authorizer["principalId"].ToString();
//             var token = request.RequestContext.Authorizer["token"]?.ToString();
//             context.Logger.LogInformation($"PrincipalId: {userId}");
//             context.Logger.LogInformation($"Token: {token}");
//
//             if (string.IsNullOrEmpty(userId))
//             {
//                 throw new Amazon.SimpleSystemsManagement.Model.ValidationException("Invalid UserId");
//             }
//
//             var body = JsonSerializationHelper.DeserializeCommand<CreateUserCommand>(request.Body);
//             var command = new CreateUserCommand(token, body.InvitationCode, body.FirstName);
//
//             context.Logger.LogInformation($"Command: {System.Text.Json.JsonSerializer.Serialize(command)}");
//
//             using var scope = _serviceProvider.CreateScope();
//             var handler = scope.ServiceProvider.GetRequiredService<CreateUserHandler>();
//
//             var result = await handler.ExecuteAsync(command);
//
//             return new APIGatewayProxyResponse
//             {
//                 StatusCode = (int) HttpStatusCode.OK,
//                 IsBase64Encoded = false,
//                 Headers = new Dictionary<string, string>
//                 {
//                     { "Content-Type", "application/json" }
//                 },
//                 Body = JsonSerializer.Serialize(result)
//             };
//         }
//         catch (ValidationException ex)
//         {
//             var exception = $"Validation exception: {ex.Message}";
//             context.Logger.LogError(exception);
//
//             return new APIGatewayProxyResponse
//             {
//                 StatusCode = (int)HttpStatusCode.BadRequest,
//                 IsBase64Encoded = false,
//                 Headers = new Dictionary<string, string>
//                 {
//                     { "Content-Type", "application/json" }
//                 },
//                 Body = exception
//             };
//         }
//         catch (Exception ex)
//         {
//             var exception = $"Error occurred: {ex.Message}";
//             context.Logger.LogError(exception);
//
//             return new APIGatewayProxyResponse
//             {
//                 StatusCode = (int)HttpStatusCode.InternalServerError,
//                 IsBase64Encoded = false,
//                 Headers = new Dictionary<string, string>
//                 {
//                     { "Content-Type", "application/json" }
//                 },
//                 Body = exception
//             };
//         }
//     }
// }
