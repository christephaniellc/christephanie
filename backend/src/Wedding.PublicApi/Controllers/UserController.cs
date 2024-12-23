using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Lambdas.User.Get.Commands;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Authorize.Providers;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private readonly IServiceProvider _serviceProvider;
        private readonly Auth0Configuration _authConfiguration;
        private readonly IAuthenticationProvider _authenticationProvider;
        private readonly IAuthorizationProvider _authorizationProvider;

        public UserController(ILogger<UserController> logger, 
            IControllerDispatcher dispatcher, 
            IServiceProvider serviceProvider, 
            IConfiguration configuration,
            IAuthenticationProvider authenticationProvider,
            IAuthorizationProvider authorizationProvider)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _serviceProvider = serviceProvider;
            _authenticationProvider = authenticationProvider;
            _authorizationProvider = authorizationProvider;
            _authConfiguration = configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
        }

        // [Authorize]
        // [HttpPost("create")]
        // [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        // public async Task<ActionResult<FamilyUnitDto>> CreateUser(string? auth0Id = null, string? invitationCode = null, string? firstName = null, 
        //     CancellationToken cancellationToken = default)
        // {
        //     auth0Id = auth0Id ?? "google-oauth2|107168580436857475897";
        //     invitationCode = invitationCode?.ToUpper() ?? "RVMBL";
        //     firstName = firstName ?? "Steph";
        //     var arn = LambdaArns.AdminFamilyUnitCreate;
        //
        //
        //     // var headers = HeaderHelper.GetHeaders(HttpContext.Request.Headers);
        //     // var token = headers["Authorization"].Replace("Bearer ", "");
        //     // var query = new ValidateAuthQuery(token, arn, invitationCode, _authConfiguration.Authority, _authConfiguration.Audience);
        //     // var authResult = await _dispatcher.GetAsync<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse>(query, cancellationToken);
        //     //
        //     // var auth0Id = authResult.PrincipalID;
        //
        //     var command = new CreateUserCommand(auth0Id, invitationCode, firstName);
        //     var result = await _dispatcher.ExecuteAsync<CreateUserCommand, FamilyUnitDto>(command, cancellationToken);
        //
        //     return Ok(result);
        // }

        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GuestDto))]
        public async Task<ActionResult<GuestDto>> GetUser(string? auth0Id = null, CancellationToken cancellationToken = default)
        {
            auth0Id = auth0Id ?? "google-oauth2|107168580436857475897";

#if !DEBUG_ANONYMOUS
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var authenticatedUser = await _authenticationProvider.Authenticate(token);
            if (authenticatedUser == null)
            {
                return Unauthorized(new { message = "Authentication error." });
            }
#endif

            var query = new GetUserQuery(auth0Id);
            var result = await _dispatcher.GetAsync<GetUserQuery, GuestDto>(query, cancellationToken);

            return Ok(result);
        }
    }
}
