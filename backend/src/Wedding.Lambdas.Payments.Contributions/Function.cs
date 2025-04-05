using System;
using System.Net;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Payments.Contributions.Commands;
using Wedding.Lambdas.Payments.Contributions.Handlers;

namespace Wedding.Lambdas.Payments.Contributions;

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
        serviceCollection.AddScoped<GetContributionsHandler>();

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
            context.Logger.LogInformation($"Raw Request Input: {request}");

            var authContext = request.GetAuthContext();
            context.Logger.LogDebug($"Raw Auth Input: {authContext.GuestId} {authContext.InvitationCode} {authContext.Roles}");

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<GetContributionsHandler>();

            var guestId = APIGatewayProxyRequestExtensions.GetCaseInsensitiveParam(request, "guestId");
            var giftCategory = APIGatewayProxyRequestExtensions.GetCaseInsensitiveParam(request, "giftCategory");

            var filter = new ContributionQueryFilter
            {
                GuestId = guestId,
                GiftCategory = giftCategory
            };
            
            var queryUnits = new GetContributionsQuery(authContext, filter);
            var results = await handler.GetAsync(queryUnits);
            return results.OkResponse();

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
