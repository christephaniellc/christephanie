using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Lambdas.User.Get.Commands;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Providers;
using Wedding.Lambdas.User.Find.Commands;

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
        private readonly IAuthorizationProvider _authorizationProvider;

        public UserController(ILogger<UserController> logger, 
            IControllerDispatcher dispatcher, 
            IServiceProvider serviceProvider, 
            IConfiguration configuration,
            IAuthorizationProvider authorizationProvider)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _serviceProvider = serviceProvider;
            _authorizationProvider = authorizationProvider;
            _authConfiguration = configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
        }

        [AllowAnonymous]
        [HttpGet("find")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<string>> FindGuest(string invitationCode, string firstName, CancellationToken cancellationToken = default)
        {
            try
            {
                var query = new FindUserQuery(invitationCode, firstName);
                var result = await _dispatcher.GetAsync<FindUserQuery, string>(query, cancellationToken);
                if (string.IsNullOrEmpty(result))
                {
                    return Unauthorized(new { message = "Invitation not found." });
                }

                return Ok(result);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GuestDto))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<GuestDto>> GetMe(CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var authenticatedUser = await _authorizationProvider.Authorize(token, LambdaArns.UserGet);
            if (authenticatedUser == null)
            {
                return Unauthorized(new { message = "Authentication error." });
            }

            try
            {
                var query = new GetUserQuery(authenticatedUser.GuestId, authenticatedUser.InvitationCode,
                    authenticatedUser.Roles);
                var result = await _dispatcher.GetAsync<GetUserQuery, GuestDto>(query, cancellationToken);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
