using System;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Wedding.Abstractions.Dtos;
using Wedding.Common.DI;
using Wedding.Lambdas.FamilyUnit.Get.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Handlers;

namespace Wedding.Lambdas.FamilyUnit.Get;

public class Function
{
    private readonly ServiceProvider _serviceProvider;

    public Function()
    {
        var serviceCollection = new ServiceCollection();

        serviceCollection.AddLambdaRegistrations(typeof(RegistrationHook));
        serviceCollection.AddScoped<GetFamilyUnitHandler>();

        _serviceProvider = serviceCollection.BuildServiceProvider();
    }

    /// <summary>
    /// Admin function that creates a family unit
    /// </summary>
    /// <param name="command">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<FamilyUnitDto> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {request.Body}");

            if (!request.PathParameters.TryGetValue("rsvpCode", out var rsvpCode) || string.IsNullOrEmpty(rsvpCode))
            {
                context.Logger.LogError("RsvpCode is missing or invalid in PathParameters.");
                throw new Exception("Invalid or missing RsvpCode in request.");
            }

            context.Logger.LogInformation($"rsvpCode: {rsvpCode}");

            if (string.IsNullOrEmpty(rsvpCode))
            {
                context.Logger.LogError("RsvpCode is null.");
                throw new Exception("Invalid RsvpCode in request.");
            }

            var command = new GetFamilyUnitQuery(rsvpCode);

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<GetFamilyUnitHandler>();
            return await handler.GetAsync(command);
        }
        catch (ValidationException ex)
        {
            context.Logger.LogError($"Validation exception: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            context.Logger.LogError($"Error occurred: {ex.Message}");
            throw;
        }
    }
}
