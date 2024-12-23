#define DEBUG_ANONYMOUS
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Providers;
using Wedding.Lambdas.FamilyUnit.Get.Commands;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/familyunit")] // Route prefix: /api/adminfamilyunit
    public class FamilyUnitController : ControllerBase
    {
        private readonly IControllerDispatcher _dispatcher;
        private IAuthenticationProvider _authProvider;
        private readonly Auth0Configuration _authConfiguration;

        public FamilyUnitController(IControllerDispatcher dispatcher, IAuthenticationProvider authProvider, Auth0Configuration authConfiguration)
        {
            _dispatcher = dispatcher;
            _authProvider = authProvider;
            _authConfiguration = authConfiguration;
        }

#if DEBUG_ANONYMOUS
        [AllowAnonymous]
#else
        [Authorize]
#endif
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        public async Task<ActionResult<FamilyUnitDto>> GetFamilyUnit(string invitationCode, string firstName, CancellationToken cancellationToken = default)
        {
            var query = new GetFamilyUnitQuery(invitationCode, firstName);
            var result = await _dispatcher.GetAsync<GetFamilyUnitQuery, FamilyUnitDto>(query, cancellationToken);

            return Ok(result);
        }

#if DEBUG_ANONYMOUS
        [AllowAnonymous]
#else
        [Authorize]
#endif
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<FamilyUnitDto>> UpdateFamilyUnit(FamilyUnitDto familyUnit, CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);

            var authQuery = new ValidateAuthQuery(token, 
                _authConfiguration.Authority, 
                _authConfiguration.Audience,
                LambdaArns.AdminFamilyUnitUpdate);

            var authUserResult = await _dispatcher.GetAsync<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse>(authQuery);
            var auth0Id = authUserResult.GetUserId();
            var invitationCode = authUserResult.GetInvitationCode();
            var roles = authUserResult.GetRoles();

            var command = new UpdateFamilyUnitCommand(familyUnit, auth0Id, invitationCode, roles);
            var result = await _dispatcher.ExecuteAsync<UpdateFamilyUnitCommand, FamilyUnitDto>(command, cancellationToken);

            return Ok(result);
        }
    }
}
