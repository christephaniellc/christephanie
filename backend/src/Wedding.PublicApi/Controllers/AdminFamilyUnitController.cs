//#define DEBUG_ANONYMOUS

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
using Wedding.Lambdas.Admin.FamilyUnit.Create.Validation;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Validation;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Validation;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Validation;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.PublicApi.Logic.Services.Auth;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/admin/familyunit")]
    public class AdminFamilyUnitController : ControllerBase
    {
        private readonly ILogger<AdminFamilyUnitController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private ILambdaAuthorizer _lambdaAuthorizer;
        private Auth0Configuration _auth0Configuration;

        public AdminFamilyUnitController(
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
                var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority, _auth0Configuration.Audience,
                    LambdaArns.AdminFamilyUnitCreate, token);
                var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
#endif
                var command = new AdminCreateFamilyUnitsCommand(familyUnits, authContext.ParseRoles());
                command.Validate();
                var result = await _dispatcher.ExecuteAsync<AdminCreateFamilyUnitsCommand, FamilyUnitDto>(command, cancellationToken);

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
        //             var token = HeaderHelper.GetTokenFromAuth(HttpContext.Request.Headers);
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
                [HttpGet]
                [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<FamilyUnitDto>))]
                public async Task<ActionResult<FamilyUnitDto>> GetFamilyUnit(string invitationCode, CancellationToken cancellationToken = default)
                {
                    if (string.IsNullOrEmpty(invitationCode))
                    {
                        return BadRequest("Invitation Code is required.");
                    }

#if !DEBUG_ANONYMOUS
                    var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
                    var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority, _auth0Configuration.Audience,
                        LambdaArns.AdminFamilyUnitCreate, token);
                    var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
#endif
                    var query = new AdminGetFamilyUnitQuery(invitationCode, authContext.ParseRoles());
                    query.Validate();
                    var result = await _dispatcher.GetAsync<AdminGetFamilyUnitQuery, List<FamilyUnitDto>>(query, cancellationToken);
        
                    return Ok(result);
                }

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
                    return BadRequest("Invitation Code is required.");
                }

                if (familyUnit == null)
                {
                    return BadRequest(new { message = "Invalid request body." });
                }

                //#if !DEBUG_ANONYMOUS
                var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
                var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority, _auth0Configuration.Audience,
                    LambdaArns.AdminFamilyUnitCreate, token);
                var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
                //#endif

                var command = new AdminUpdateFamilyUnitCommand(familyUnit, authContext.ParseRoles());
                command.Validate();
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
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(DeleteResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AdminDeleteFamilyUnitAsync(string invitationCode, CancellationToken cancellationToken = default)
        {
#if !DEBUG_ANONYMOUS
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority, _auth0Configuration.Audience,
                LambdaArns.AdminFamilyUnitCreate, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
#endif
            var command = new AdminDeleteFamilyUnitCommand(invitationCode, authContext.ParseRoles());
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<AdminDeleteFamilyUnitCommand, bool>(command, cancellationToken);
            
            return Ok(new DeleteResponse { Success = result });
        }
    }
}
