using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Services;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/admin/familyunit")]
    public class AdminFamilyUnitController : ControllerBase
    {
        private readonly ILogger<AdminFamilyUnitController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private IAuthorizationProvider _authProvider;

        public AdminFamilyUnitController(
            ILogger<AdminFamilyUnitController> logger,
            IControllerDispatcher dispatcher, 
            IAuthorizationProvider authProvider)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _authProvider = authProvider;
        }

        //[Authorize]
        [HttpPost("create")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        public async Task<ActionResult<FamilyUnitDto>> CreateFamilyUnits([FromBody] List<FamilyUnitDto> familyUnits, CancellationToken cancellationToken = default)
        {
            try
            { 
                var headers = Request.Headers
                    .ToDictionary(header => header.Key, header => header.Value.ToString()); ;

                // TODO: Move check to internal middleware referencing database roles
                // Parse and validate Auth0 token (from request headers) and admin role
                var authCheck = _authProvider.ValidateAuthToken(headers, needsAdmin: true);
                if (!authCheck.Authorized)
                {
                    return Unauthorized(authCheck.Response);
                }

                if (familyUnits == null || !familyUnits.Any())
                {
                    return BadRequest(new { message = "Invalid request body." });
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

        
        //
        // [FunctionName("UpdateFamilyUnit")]
        // public static async Task<IActionResult> UpdateFamilyUnit(
        //     [HttpTrigger(AuthorizationLevel.Function, "put", Route = "family-unit/{code}")] HttpRequest req, string code)
        // {
        //     string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        //     var updateRequest = JsonSerializer.Deserialize<UpdateFamilyUnitCommand>(requestBody);
        //
        //     // Database update logic here (e.g., find the family unit by code and update)
        //     // Example pseudo-code for database update:
        //     // Database.UpdateFamilyUnit(code, updateRequest);
        //
        //     return new OkObjectResult(new { message = "Family unit updated successfully" });
        // }
    }
}
