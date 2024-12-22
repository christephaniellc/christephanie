using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Services.Auth;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/admin/familyunit")]
    public class AdminFamilyUnitController : ControllerBase
    {
        private readonly ILogger<AdminFamilyUnitController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private IAuthenticationProvider _authProvider;

        public AdminFamilyUnitController(
            ILogger<AdminFamilyUnitController> logger,
            IControllerDispatcher dispatcher,
            IAuthenticationProvider authProvider)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _authProvider = authProvider;
        }

        //[Authorize]
        [AllowAnonymous]
        [HttpPost("create")]
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

                // var headers = Request.Headers
                //     .ToDictionary(header => header.Key, header => header.Value.ToString());

                // var headers = HeaderHelper.GetHeaders(Request.Headers);
                var headers = HeaderHelper.GetHeaders(HttpContext.Request.Headers);

                // TODO: Move check to internal middleware referencing database roles
                // Parse and validate Auth0 token (from request headers) and admin role
                var authCheck = await _authProvider.ValidateAuthToken(headers, needsAdmin: true);
                if (!authCheck.Authorized)
                {
                    return Unauthorized(new { message = authCheck.ResponseMessage });
                }

                foreach (var unit in familyUnits)
                {
                    var command = new CreateFamilyUnitsCommand(familyUnits);
                    var result = await _dispatcher.ExecuteAsync<CreateFamilyUnitsCommand, FamilyUnitDto>(command, cancellationToken);
                }

                return Ok(familyUnits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in AdminFamilyUnitController.");
                return Problem(ex.Message);
            }
        }

        //[Authorize]
        [AllowAnonymous]
        [HttpGet("{interested}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<FamilyUnitDto>))]
        public async Task<ActionResult<FamilyUnitDto>> GetFamilyUnits(bool? interested,
            //[FromBody] APIGatewayProxyRequest request //, 
            //  [FromServices] ILambdaContext context
            CancellationToken cancellationToken = default
        )
        {
            var headers = HeaderHelper.GetHeaders(HttpContext.Request.Headers);

            // TODO: Move check to internal middleware referencing database roles
            // Parse and validate Auth0 token (from request headers) and admin role
            var authCheck = await _authProvider.ValidateAuthToken(headers, needsAdmin: true);
            if (!authCheck.Authorized)
            {
                return Unauthorized(new { message = authCheck.ResponseMessage });
            }

            var query = new GetFamilyUnitsQuery { Interested = interested };
            var result = await _dispatcher.GetAsync<GetFamilyUnitsQuery, List<FamilyUnitDto>>(query, cancellationToken);

            return Ok(result);
        }

        //[Authorize]
        [AllowAnonymous]
        [HttpPut("")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<FamilyUnitDto>> AdminUpdateFamilyUnit([FromBody] FamilyUnitDto familyUnit, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrEmpty(familyUnit.RsvpCode))
                {
                    return BadRequest("RSVP Code is required.");
                }

                if (familyUnit == null)
                {
                    return BadRequest(new { message = "Invalid request body." });
                }

                // var headers = Request.Headers
                //     .ToDictionary(header => header.Key, header => header.Value.ToString());

                //var headers = HeaderHelper.GetHeaders(Request.Headers);
                var headers = HeaderHelper.GetHeaders(HttpContext.Request.Headers);

                var authCheck = await _authProvider.ValidateAuthToken(headers, needsAdmin: true);
                if (!authCheck.Authorized)
                {
                    return Unauthorized(new { message = authCheck.ResponseMessage });
                }

                var command = new UpdateFamilyUnitCommand(familyUnit);
                var result = await _dispatcher.ExecuteAsync<UpdateFamilyUnitCommand, FamilyUnitDto>(command, cancellationToken);

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

        //[Authorize]
        [AllowAnonymous]
        [HttpDelete("{invitationCode}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(DeleteResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> AdminDeleteFamilyUnitAsync(string invitationCode, CancellationToken cancellationToken = default)
        {
            var headers = HeaderHelper.GetHeaders(HttpContext.Request.Headers);
            
            var authCheck = await _authProvider.ValidateAuthToken(headers, needsAdmin: true);
            if (!authCheck.Authorized)
            {
                return Unauthorized(new { message = authCheck.ResponseMessage }); ;
            }

            var command = new DeleteFamilyUnitCommand(invitationCode);
            var result = await _dispatcher.ExecuteAsync<DeleteFamilyUnitCommand, bool>(command, cancellationToken);
            
            return Ok(new DeleteResponse { Success = result });
        }
    }
}
