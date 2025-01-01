using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Common.Configuration;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.AWS.Frontend;
using Wedding.Common.Serialization;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.FamilyUnit.Update.Commands;
using Wedding.Lambdas.FamilyUnit.Update.Handlers;

namespace Wedding.Lambdas.FamilyUnit.Update;

public class Function
{
    private readonly ServiceProvider _serviceProvider;

    public Function()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));
        serviceCollection.AddScoped<UpdateFamilyUnitHandler>();

        serviceCollection.AddSingleton<Lazy<Task<IUspsMailingAddressValidationProvider>>>(sp =>
        {
            return new Lazy<Task<IUspsMailingAddressValidationProvider>>(async () =>
            {
                var region = AwsRegionHelper.GetRegionEndpointFromEnvironment();
                var uspsConfig = await AwsParameterStoreHelper.GetParameterAsync<UspsConfiguration>("/usps/api/credentials", region);
                return new UspsMailingAddressValidationProvider(uspsConfig.ApiUrl, uspsConfig.ConsumerKey, uspsConfig.ConsumerSecret);
            });
        });

        _serviceProvider = serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Admin function that creates a family unit
    /// </summary>
    /// <param name="request">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {request.Body}");

            var command = JsonSerializationHelper.DeserializeCommand<UpdateFamilyUnitCommand>(request.Body);

            if (command.FamilyUnit == null)
            {
                context.Logger.LogError("FamilyUnit is null.");
                throw new Exception("Invalid FamilyUnit in request.");
            }

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<UpdateFamilyUnitHandler>();
            var result = await handler.ExecuteAsync(command);
            
            return new APIGatewayProxyResponse
            {
                StatusCode = (int )HttpStatusCode.OK,
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
                        Error = typeof(ValidationException).ToString(),
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
                        Error = typeof(Exception).ToString(),
                        Description = error
                    }
                }.ToBody()
            };
        }
    }
}
