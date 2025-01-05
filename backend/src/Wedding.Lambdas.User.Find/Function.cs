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
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.AWS.Frontend;
using Wedding.Lambdas.User.Find.Commands;
using Wedding.Lambdas.User.Find.Handlers;

namespace Wedding.Lambdas.User.Find;

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
        serviceCollection.AddScoped<FindUserHandler>();

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
            FindUserQuery query;
            context.Logger.LogInformation($"Raw Query Input: {request.QueryStringParameters}");

            var invitationCode = request.GetInvitationCodeFromParams();
            var firstName = request.GetFirstNameFromParams();

            context.Logger.LogInformation($"Query Input: {invitationCode} {firstName}");

            query = new FindUserQuery(invitationCode, firstName);
            
            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<FindUserHandler>();
            var result = await handler.GetAsync(query);

            return result.OkResponse();
        }
        // catch (UnauthorizedAccessException ex)
        // {
        //     var viewError = $"Invitation not found. Please contact your hosts to resolve.";
        //     var error = $"Authorization exception: {ex.Message}";
        //     context.Logger.LogError(error);
        //
        //     return viewError.ErrorResponse((int)HttpStatusCode.Unauthorized, typeof(UnauthorizedAccessException).ToString());
        // }
        catch (ValidationException ex)
        {
            var viewError = $"Invitation not found. Please contact your hosts to resolve.";
            var logError = $"Validation exception: {ex.Message}";
            context.Logger.LogError(logError);

            return viewError.ErrorResponse((int)HttpStatusCode.BadRequest, typeof(ValidationException).ToString());
        }
        catch (Exception ex)
        {
            var viewError = $"Application exception. Please contact your hosts to resolve.";
            var logError = $"Error occurred: {ex.Message}";
            context.Logger.LogError(logError);

            return viewError.ErrorResponse((int)HttpStatusCode.InternalServerError, typeof(Exception).ToString());
        }
    }
}
