using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Handlers;
using Microsoft.Extensions.Logging;
using Wedding.Common.Dispatchers;
using Wedding.Abstractions.Dtos;
using System.Threading;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Validate.Address.Commands;
using Microsoft.AspNetCore.Authorization;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Providers;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api")] // Route prefix: /api/helloworld
    public class HelloWorldController : ControllerBase
    {
        private readonly ILogger<HelloWorldController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private readonly IServiceProvider _serviceProvider;
        private IAuthorizationProvider _authProvider;

        public HelloWorldController(ILogger<HelloWorldController> logger, 
            IControllerDispatcher dispatcher, 
            IServiceProvider serviceProvider,
            IAuthorizationProvider authProvider)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _serviceProvider = serviceProvider;
            _authProvider = authProvider;
        }

        [AllowAnonymous]
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

        [AllowAnonymous]
        [HttpPost("address-validate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AddressDto>> AddressValidate([FromBody] AddressDto address, CancellationToken cancellationToken = default)
        {
            try
            {
                if (address == null)
                {
                    return BadRequest(new { message = "Invalid request body." });
                }

#if !DEBUG_ANONYMOUS
                var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
                var authenticatedUser = await _authProvider.Authorize(token, LambdaArns.AddressValidate);
                if (authenticatedUser == null)
                {
                    return Unauthorized(new { message = "Authentication error." });
                }
#endif

                var command = new ValidateUspsAddressQuery(address);
                var result = await _dispatcher.GetAsync<ValidateUspsAddressQuery, AddressDto>(command, cancellationToken);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in AdminFamilyUnitController.");
                return Problem(ex.Message);
            }
        }

        [Authorize]
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
