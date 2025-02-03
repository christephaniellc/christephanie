using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Authorize.Commands;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api")] 
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private readonly IServiceProvider _serviceProvider;
        private readonly Auth0Configuration _authConfiguration;

        public AuthController(ILogger<AuthController> logger, IControllerDispatcher dispatcher, IServiceProvider serviceProvider, IConfiguration configuration)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _serviceProvider = serviceProvider;
            _authConfiguration = configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
        }

        [Authorize]
        [HttpGet("authorize")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(APIGatewayCustomAuthorizerResponse))]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIGatewayCustomAuthorizerResponse>> AuthorizeUser(string? invitationCode = null, 
            string? firstName = null,
            string? arn = null, CancellationToken cancellationToken = default)
        {
            arn = arn ?? "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-authorize";
            invitationCode = invitationCode?.ToUpper() ?? "RVMBL";
            firstName = firstName ?? "Steph";

            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var query = new ValidateAuthQuery(_authConfiguration.Authority, _authConfiguration.Audience, arn, token);
            var result = await _dispatcher.GetAsync<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse>(query, cancellationToken);
        
            return Ok(result);
        }
    }
}
