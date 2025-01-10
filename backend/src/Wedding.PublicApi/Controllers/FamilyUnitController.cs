using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Validation;
using Wedding.Lambdas.FamilyUnit.Update.Commands;
using Wedding.Lambdas.FamilyUnit.Update.Validation;
using Wedding.PublicApi.Logic.Services.Auth;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/familyunit")] // Route prefix: /api/adminfamilyunit
    public class FamilyUnitController : ControllerBase
    {
        private readonly IControllerDispatcher _dispatcher;
        private ILambdaAuthorizer _lambdaAuthorizer;
        private Auth0Configuration _auth0Configuration;

        public FamilyUnitController(IControllerDispatcher dispatcher, Auth0Configuration auth0Configuration, ILambdaAuthorizer lambdaAuthorizer)
        {
            _dispatcher = dispatcher;
            _lambdaAuthorizer = lambdaAuthorizer;
            _auth0Configuration = auth0Configuration;
        }

        [Authorize]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FamilyUnitDto>> GetFamilyUnit(CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority, _auth0Configuration.Audience,
                LambdaArns.AdminFamilyUnitCreate, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var query = new GetFamilyUnitQuery(authContext.InvitationCode, authContext.GuestId, authContext.ParseRoles());
            query.Validate();
            var result = await _dispatcher.GetAsync<GetFamilyUnitQuery, FamilyUnitDto>(query, cancellationToken);

            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<FamilyUnitDto>> UpdateFamilyUnit(FamilyUnitDto familyUnit, CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority, _auth0Configuration.Audience,
                LambdaArns.AdminFamilyUnitCreate, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var command = new UpdateFamilyUnitCommand(familyUnit, authContext.InvitationCode, authContext.GuestId, authContext.ParseRoles());
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<UpdateFamilyUnitCommand, FamilyUnitDto>(command, cancellationToken);

            return Ok(result);
        }
    }
}
