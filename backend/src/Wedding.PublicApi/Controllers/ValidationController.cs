

using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Enums;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api")] // Route prefix: /api/helloworld
    public class ValidationController : ControllerBase
    {
        private readonly ILogger<ValidationController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private readonly IServiceProvider _serviceProvider;
        private readonly Auth0Configuration _authConfiguration;

        public ValidationController(ILogger<ValidationController> logger, IControllerDispatcher dispatcher, IServiceProvider serviceProvider, IConfiguration configuration)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _serviceProvider = serviceProvider;
            _authConfiguration = configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
        }

        [Authorize]
        [HttpGet("authorize")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(APIGatewayCustomAuthorizerResponse))]
        public async Task<ActionResult<APIGatewayCustomAuthorizerResponse>> AuthorizeUser(string? invitationCode = null, string? arn = null, CancellationToken cancellationToken = default)
        {
            invitationCode = invitationCode?.ToUpper() ?? "RVMBL";
            arn = arn ?? LambdaArns.AdminFamilyUnitCreate;

            var headers = HeaderHelper.GetHeaders(HttpContext.Request.Headers);
            var token = headers["Authorization"].Replace("Bearer ", "");
            var query = new ValidateAuthorizationQuery(token, arn, invitationCode, _authConfiguration.Authority, _authConfiguration.Audience);
            var result = await _dispatcher.GetAsync<ValidateAuthorizationQuery, APIGatewayCustomAuthorizerResponse>(query, cancellationToken);
        
            return Ok(result);
        }
    }
}
