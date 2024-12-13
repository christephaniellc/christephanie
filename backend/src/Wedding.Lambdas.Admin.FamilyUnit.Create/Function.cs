using Amazon.Lambda.Core;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Common.DI;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Handlers;
using Wedding.Common.Serialization;

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
    /// <param name="command">The event for the Lambda function handler to process.</param>
    /// <param name="context">The ILambdaContext that provides methods for logging and describing the Lambda environment.</param>
    /// <returns></returns>
    public async Task<FamilyUnitDto> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Raw Input: {request.Body}");

            var command = JsonSerializationHelper.DeserializeCommand<CreateFamilyUnitCommand>(request.Body);

            if (command.FamilyUnit == null)
            {
                context.Logger.LogError("FamilyUnit is null.");
                throw new Exception("Invalid FamilyUnit in request.");
            }

            context.Logger.LogInformation($"Command: {System.Text.Json.JsonSerializer.Serialize(command)}");
            context.Logger.LogInformation($"FamilyUnit: {System.Text.Json.JsonSerializer.Serialize(command.FamilyUnit)}");

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<CreateFamilyUnitHandler>();
            return await handler.ExecuteAsync(command);
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
