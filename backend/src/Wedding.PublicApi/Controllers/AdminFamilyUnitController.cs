using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.PortableExecutable;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
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
        [HttpPost("create")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
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
                    var command = new CreateFamilyUnitCommand(unit);
                    var result = await _dispatcher.ExecuteAsync<CreateFamilyUnitCommand, FamilyUnitDto>(command, cancellationToken);
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
        //[HttpPost("update")]
        [HttpPut("{rsvpCode}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        public async Task<ActionResult<FamilyUnitDto>> AdminUpdateFamilyUnit(string rsvpCode, [FromBody] FamilyUnitDto familyUnit, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrEmpty(rsvpCode))
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

                var command = new UpdateFamilyUnitCommand(rsvpCode, familyUnit);
                var result = await _dispatcher.ExecuteAsync<UpdateFamilyUnitCommand, FamilyUnitDto>(command, cancellationToken);

                return Ok(familyUnit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in AdminFamilyUnitController.");
                return Problem(ex.Message);
            }
        }

        [HttpDelete("{rsvpCode}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<bool> AdminDeleteFamilyUnitAsync(string rsvpCode, CancellationToken cancellationToken = default)
        {
            // var headers = Request.Headers
            //     .ToDictionary(header => header.Key, header => header.Value.ToString()); ;

            //var headers = HeaderHelper.GetHeaders(Request.Headers);
            var headers = HeaderHelper.GetHeaders(HttpContext.Request.Headers);
            
            var authCheck = await _authProvider.ValidateAuthToken(headers, needsAdmin: true);
            if (!authCheck.Authorized)
            {
                return false;
            }

            var command = new DeleteFamilyUnitCommand(rsvpCode);
            return await _dispatcher.ExecuteAsync<DeleteFamilyUnitCommand, bool>(command, cancellationToken);
        }
    }
}
