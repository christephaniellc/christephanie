using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Handlers;
using Microsoft.AspNetCore.Http;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api")] // Route prefix: /api/helloworld
    public class HelloWorldController : ControllerBase
    {
        private readonly IServiceProvider _serviceProvider;

        public HelloWorldController(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        [HttpGet("helloworld")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<APIGatewayProxyResponse> HelloWorld()
        {
            var response = new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Body = "Hey, World!",
                Headers = new Dictionary<string, string> { { "Content-Type", "text/plain" } }
            };

            return await Task.FromResult(response);
        }

        [HttpGet("debugdb")]
        public IActionResult DebugDependencies()
        {
            try
            {
                var dynamoDbClient = _serviceProvider.GetRequiredService<IAmazonDynamoDB>();
                Console.WriteLine("DynamoDB Client resolved: " + dynamoDbClient);

                var dynamoDbContext = _serviceProvider.GetRequiredService<IDynamoDBContext>();
                Console.WriteLine("DynamoDB Context resolved: " + dynamoDbContext);

                var handler = _serviceProvider.GetRequiredService<CreateFamilyUnitHandler>();
                Console.WriteLine("CreateFamilyUnitHandler resolved: " + handler);

                return Ok("Dependencies resolved successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Dependency resolution failed: " + ex);
            }
        }
    }
}
