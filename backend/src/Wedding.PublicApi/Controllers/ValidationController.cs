using Amazon.Lambda.APIGatewayEvents;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.FamilyUnit.Get.Commands;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api")] // Route prefix: /api/helloworld
    public class ValidationController
    {
        private readonly ILogger<ValidationController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private readonly IServiceProvider _serviceProvider;

        public ValidationController(ILogger<ValidationController> logger, IControllerDispatcher dispatcher, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _serviceProvider = serviceProvider;
        }
        
        // [HttpGet("authorize")]
        // [ProducesResponseType(StatusCodes.Status200OK)]
        // public async Task<APIGatewayCustomAuthorizerResponse> AuthorizeUser()
        // {
        //     var headers = HeaderHelper.GetHeaders(HttpContext.Request.Headers);
        //
        //     // TODO: Move check to internal middleware referencing database roles
        //     // Parse and validate Auth0 token (from request headers) and admin role
        //     var authCheck = await _authProvider.ValidateAuthToken(headers, needsAdmin: true);
        //     var query = new GetFamilyUnitQuery(rsvpCode, firstName);
        //     var result = await _dispatcher.GetAsync<GetFamilyUnitQuery, FamilyUnitDto>(query, cancellationToken);
        //
        //     return Ok(result);
        // }
    }
}
