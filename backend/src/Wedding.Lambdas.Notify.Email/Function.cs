using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Notify.Email.Commands;
using Wedding.Lambdas.Notify.Email.Handlers;

namespace Wedding.Lambdas.Notify.Email;

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
        serviceCollection.AddScoped<SendEmailNotificationHandler>();
        serviceCollection.AddScoped<GetEmailNotificationsHandler>();

        serviceCollection.AddSingleton<Lazy<Task<IAwsSesHelper>>>(sp =>
        {
            return new Lazy<Task<IAwsSesHelper>>(async () =>
            {
                var config = await AwsParameterCache.GetConfigAsync<ApplicationConfiguration>();
                return new AwsSesHelper(config);
            });
        });

        serviceCollection.AddScoped<IAwsSesHelper>(sp =>
        {
            var lazyProvider = sp.GetRequiredService<Lazy<Task<IAwsSesHelper>>>();
            return lazyProvider.Value.GetAwaiter().GetResult();
        });

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
            context.Logger.LogDebug(
                $"Raw Auth Input: {authContext.GuestId} {authContext.InvitationCode} {authContext.Roles}");

            using var scope = _serviceProvider.CreateScope();

            context.Logger.LogInformation($"HttpMethod: {request.HttpMethod?.ToUpperInvariant()}");
            context.Logger.LogInformation($"authContext: {JsonSerializer.Serialize(authContext)}");

            switch (request.HttpMethod?.ToUpperInvariant())
            {
                case "POST":
                {
                    var guestId = APIGatewayProxyRequestExtensions.GetCaseInsensitiveParam(request, "guestId");
                    var command = new SendRsvpNotificationCommand(authContext, guestId);
                    var handler = scope.ServiceProvider.GetRequiredService<SendEmailNotificationHandler>();

                    var results = await handler.ExecuteAsync(command);
                    return results.OkResponse();
                    break;
                }
                case "GET":
                {
                    var handler = scope.ServiceProvider.GetRequiredService<GetEmailNotificationsHandler>();
                    var query = new GetEmailNotificationsQuery(authContext);
                    var results = await handler.GetAsync(query);
                    return results.OkResponse();
                    break;
                }
                default:
                    return $"Unsupported HTTP method: {request.HttpMethod}".ErrorResponse(
                        (int)HttpStatusCode.MethodNotAllowed,
                        typeof(MissingMethodException).ToString());

            }
        }
        catch (UnauthorizedAccessException ex)
        {
            var error = $"Authorization exception: {ex.Message}";
            context.Logger.LogError(error);

            return error.ErrorResponse((int)HttpStatusCode.Unauthorized,
                typeof(UnauthorizedAccessException).ToString());
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
