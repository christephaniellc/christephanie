using System;
using System.Net;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration;
using Wedding.Common.DI;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Validate.Address.Commands;
using Wedding.Lambdas.Validate.Address.Handlers;

namespace Wedding.Lambdas.Validate.Address;

public class Function
{
    private readonly ServiceProvider _serviceProvider;
    private readonly IMapper _mapper;

    public Function()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));
        serviceCollection.AddScoped<UspsAddressValidationHandler>();

        serviceCollection.AddSingleton<Lazy<Task<IUspsMailingAddressValidationProvider>>>(sp =>
        {
            return new Lazy<Task<IUspsMailingAddressValidationProvider>>(async () =>
            {
                var uspsConfig = await AwsParameterCache.GetConfigAsync<UspsConfiguration>();
                return new UspsMailingAddressValidationProvider(uspsConfig.ApiUrl, uspsConfig.ConsumerKey, uspsConfig.ConsumerSecret);
            });
        });

        serviceCollection.AddScoped<IUspsMailingAddressValidationProvider>(sp =>
        {
            var lazyProvider = sp.GetRequiredService<Lazy<Task<IUspsMailingAddressValidationProvider>>>();
            return lazyProvider.Value.GetAwaiter().GetResult();
        });

        _serviceProvider = serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Returns a well-formed USPS address
    /// </summary>
    /// <param name="request">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {request.Body}");

            var authContext = request.GetAuthContext();

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<UspsAddressValidationHandler>();
            
            var dto = JsonSerializationHelper.DeserializeFromFrontend<AddressDto>(request.Body);
            context.Logger.LogInformation($"Deserialized Input: {dto.StreetAddress}");

            var query = new ValidateUspsAddressQuery(dto);

            var result = await handler.GetAsync(query);

            return result.OkResponse();
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
