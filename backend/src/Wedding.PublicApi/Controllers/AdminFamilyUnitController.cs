#define DEBUG_ANONYMOUS

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Providers;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/admin/familyunit")]
    public class AdminFamilyUnitController : ControllerBase
    {
        private readonly ILogger<AdminFamilyUnitController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private IAuthorizationProvider _authProvider;
        private Auth0Configuration _auth0Configuration;

        public AdminFamilyUnitController(
            ILogger<AdminFamilyUnitController> logger,
            IConfiguration configuration,
            IControllerDispatcher dispatcher,
            IAuthorizationProvider authProvider)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _authProvider = authProvider;
            _auth0Configuration = configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
        }

#if DEBUG_ANONYMOUS
        [AllowAnonymous]
#else
        [Authorize]
#endif
        [HttpPut("create")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<FamilyUnitDto>> AdminCreateFamilyUnits([FromBody] List<FamilyUnitDto> familyUnits, CancellationToken cancellationToken = default)
        {
            try
            {
                if (familyUnits == null || !familyUnits.Any())
                {
                    return BadRequest(new { message = "Invalid request body." });
                }

#if !DEBUG_ANONYMOUS
                var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
                var authenticatedUser = await _authProvider.GetGuestIdFromToken(token);
                if (authenticatedUser == null)
                {
                    return Unauthorized(new { message = "Authentication error." });
                }
#endif

                foreach (var unit in familyUnits)
                {
                    var command = new AdminCreateFamilyUnitsCommand(familyUnits);
                    var result = await _dispatcher.ExecuteAsync<AdminCreateFamilyUnitsCommand, FamilyUnitDto>(command, cancellationToken);
                }

                return Ok(familyUnits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in AdminFamilyUnitController.");
                return Problem(ex.Message);
            }
        }

// #if DEBUG_ANONYMOUS
//         [AllowAnonymous]
// #else
//         [Authorize]
// #endif
//         [HttpGet("{interested}")]
//         [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<FamilyUnitDto>))]
//         public async Task<ActionResult<FamilyUnitDto>> GetFamilyUnits(bool? interested,
//             //[FromBody] APIGatewayProxyRequest request //, 
//             //  [FromServices] ILambdaContext context
//             CancellationToken cancellationToken = default
//         )
//         {
// #if !DEBUG_ANONYMOUS
//             var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
//             var authenticatedUser = await _authProvider.GetGuestIdFromToken(token);
//             if (authenticatedUser == null)
//             {
//                 return Unauthorized(new { message = "Authentication error." });
//             }
// #endif
//
//             var query = new GetFamilyUnitsQuery { Interested = interested };
//             var result = await _dispatcher.GetAsync<GetFamilyUnitsQuery, List<FamilyUnitDto>>(query, cancellationToken);
//
//             return Ok(result);
//         }

#if DEBUG_ANONYMOUS
        [AllowAnonymous]
#else
        [Authorize]
#endif
        [HttpPost("")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<FamilyUnitDto>> AdminUpdateFamilyUnit([FromBody] FamilyUnitDto familyUnit, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrEmpty(familyUnit.InvitationCode))
                {
                    return BadRequest("RSVP Code is required.");
                }

                if (familyUnit == null)
                {
                    return BadRequest(new { message = "Invalid request body." });
                }

//#if !DEBUG_ANONYMOUS
                var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
                var query = new ValidateAuthQuery(_auth0Configuration.Authority, _auth0Configuration.Audience,
                    LambdaArns.AdminFamilyUnitUpdate, token);
                var authenticatedGuest = await _authProvider.Authorize(query);
                if (authenticatedGuest == null)
                {
                    return Unauthorized(new { message = "Authentication error." });
                }
//#endif

                var command = new AdminUpdateFamilyUnitCommand(familyUnit,
                    authenticatedGuest.Roles);
                var result = await _dispatcher.ExecuteAsync<AdminUpdateFamilyUnitCommand, FamilyUnitDto>(command, cancellationToken);

                return Ok(familyUnit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in AdminFamilyUnitController.");
                return Problem(ex.Message);
            }
        }
        public class DeleteResponse
        {
            public bool Success { get; set; }
        }

#if DEBUG_ANONYMOUS
        [AllowAnonymous]
#else
        [Authorize]
#endif
        [HttpDelete("{UserInvitationCode}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(DeleteResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AdminDeleteFamilyUnitAsync(string invitationCode, CancellationToken cancellationToken = default)
        {
#if !DEBUG_ANONYMOUS
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var authenticatedUser = await _authProvider.GetGuestIdFromToken(token);
            if (authenticatedUser == null)
            {
                return Unauthorized(new { message = "Authentication error" }); ;
            }
#endif

            var command = new AdminDeleteFamilyUnitCommand(invitationCode);
            var result = await _dispatcher.ExecuteAsync<AdminDeleteFamilyUnitCommand, bool>(command, cancellationToken);
            
            return Ok(new DeleteResponse { Success = result });
        }
    }
}
