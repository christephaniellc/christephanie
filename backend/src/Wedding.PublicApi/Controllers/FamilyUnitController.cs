using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Commands;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/familyunit")] // Route prefix: /api/adminfamilyunit
    public class FamilyUnitController : ControllerBase
    {
        private readonly IControllerDispatcher _dispatcher;
        private readonly Auth0Configuration _authConfiguration;

        public FamilyUnitController(IControllerDispatcher dispatcher, Auth0Configuration authConfiguration)
        {
            _dispatcher = dispatcher;
            _authConfiguration = authConfiguration;
        }

        [Authorize]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        public async Task<ActionResult<FamilyUnitDto>> GetFamilyUnit(CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);

            var authQuery = new ValidateAuthQuery(_authConfiguration.Authority, _authConfiguration.Audience, LambdaArns.FamilyUnitGet, token);
            var authResponse = await _dispatcher.GetAsync<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse>(authQuery);

            var query = new GetFamilyUnitQuery(authResponse.GetInvitationCode(), authResponse.GetGuestId(), authResponse.GetRoles());
            var result = await _dispatcher.GetAsync<GetFamilyUnitQuery, FamilyUnitDto>(query, cancellationToken);

            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<FamilyUnitDto>> UpdateFamilyUnit(FamilyUnitDto familyUnit, CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);

            var authQuery = new ValidateAuthQuery(_authConfiguration.Authority, _authConfiguration.Audience, LambdaArns.AdminFamilyUnitUpdate, token);
            var authUserResult = await _dispatcher.GetAsync<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse>(authQuery);

            var command = new AdminUpdateFamilyUnitCommand(familyUnit, authUserResult.GetRoles());
            var result = await _dispatcher.ExecuteAsync<AdminUpdateFamilyUnitCommand, FamilyUnitDto>(command, cancellationToken);

            return Ok(result);
        }
    }
}
