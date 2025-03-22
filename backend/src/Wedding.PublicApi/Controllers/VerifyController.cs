using System;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.PublicApi.Logic.Services.Auth;
using Wedding.Lambdas.Verify.Email.Commands;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/verify")]
    public class VerifyController : ControllerBase
    {
        private readonly ILogger<VerifyController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private readonly IServiceProvider _serviceProvider;
        private ILambdaAuthorizer _lambdaAuthorizer;
        private Auth0Configuration _auth0Configuration; public VerifyController(ILogger<VerifyController> logger,
            IControllerDispatcher dispatcher,
            IServiceProvider serviceProvider,
            IConfiguration configuration,
            ILambdaAuthorizer lambdaAuthorizer)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _serviceProvider = serviceProvider;
            _lambdaAuthorizer = lambdaAuthorizer;
            _auth0Configuration = configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
        }

        //[Authorize]
        [HttpPost("email")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VerifyEmailResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<VerifyEmailResponse>> ValidatePhone(string token, CancellationToken cancellationToken = default)
        {
            //var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            // var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
            //     LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            // var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var command = new VerifyEmailCommand(_auth0Configuration.Authority, _auth0Configuration.Audience, token);
            //command.Validate();
            var result = await _dispatcher.ExecuteAsync<VerifyEmailCommand, VerifyEmailResponse>(command, cancellationToken);

            return Ok(result);
        }
    }
}
