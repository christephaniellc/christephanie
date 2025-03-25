using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.Configuration;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.PublicApi.Logic.Services.Auth;
using System;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.Configuration.Invitation.Commands;
using Wedding.Lambdas.Admin.InvitationDesign.Validation;
using Wedding.Lambdas.Authorize.Commands;
using static Wedding.PublicApi.Controllers.AdminFamilyUnitController;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/admin/configuration")] // Route prefix: /api/admin/configuration
    public class AdminConfigurationController : ControllerBase
    {
        private readonly ILogger<AdminFamilyUnitController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private ILambdaAuthorizer _lambdaAuthorizer;
        private Auth0Configuration _auth0Configuration;

        public AdminConfigurationController(
            ILogger<AdminFamilyUnitController> logger,
            IConfiguration configuration,
            IControllerDispatcher dispatcher,
            ILambdaAuthorizer lambdaAuthorizer)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _lambdaAuthorizer = lambdaAuthorizer;
            _auth0Configuration = configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
        }

        [Authorize]
        [HttpPost("invitation")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(InvitationDesignDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<InvitationDesignDto>> AdminCreateInvitationDesign(
            [FromBody] InvitationDesignDto invitation, CancellationToken cancellationToken = default)
        {
            try
            {
                if (invitation == null)
                {
                    return BadRequest(new { message = "Invalid request body." });
                }

                var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
                var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
                var authRequest = new ValidateAuthQuery(_auth0Configuration!.Authority!, _auth0Configuration!.Audience!,
                    LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
                var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
                var command = new AdminSavePhotoConfigurationCommand(authContext, invitation);
                command.Validate();
                var result = await _dispatcher.ExecuteAsync<AdminSavePhotoConfigurationCommand, InvitationDesignDto>(command, cancellationToken);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in AdminConfigurationController.");
                return Problem(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("invitation/{designId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(InvitationDesignDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FamilyUnitDto>> GetInvitationDesign(string designId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(designId))
            {
                return BadRequest("designId is required.");
            }

            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
            var query = new AdminGetPhotoConfigurationQuery(authContext, designId);
            query.Validate();
            var result = await _dispatcher.GetAsync<AdminGetPhotoConfigurationQuery, InvitationDesignDto>(query, cancellationToken);

            return Ok(result);
        }

        [Authorize]
        [HttpGet("invitation")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<InvitationDesignDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<InvitationDesignDto>>> GetInvitationDesigns(CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
            var query = new AdminGetPhotoConfigurationsQuery(authContext);
            query.Validate();
            var result = await _dispatcher.GetAsync<AdminGetPhotoConfigurationsQuery, List<InvitationDesignDto>>(query, cancellationToken);

            return Ok(result);
        }

        [Authorize]
        [HttpDelete("invitation")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(DeleteResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AdminDeleteFamilyUnitAsync(string designId, CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var command = new AdminDeletePhotoConfigurationCommand(authContext, designId);
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<AdminDeletePhotoConfigurationCommand, bool>(command, cancellationToken);

            return Ok(new DeleteResponse { Success = result });
        }
    }
}
