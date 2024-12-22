using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;
using Wedding.Lambdas.Authorize.Providers;
using Wedding.Lambdas.FamilyUnit.Get.Commands;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/familyunit")] // Route prefix: /api/adminfamilyunit
    public class FamilyUnitController : ControllerBase
    {
        private readonly IControllerDispatcher _dispatcher;
        private IAuthorizationProvider _authProvider;

        public FamilyUnitController(IControllerDispatcher dispatcher, IAuthorizationProvider authProvider)
        {
            _dispatcher = dispatcher;
            _authProvider = authProvider;
        }

        //[Authorize]
        [AllowAnonymous]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        public async Task<ActionResult<FamilyUnitDto>> GetFamilyUnit(string invitationCode, string firstName, CancellationToken cancellationToken = default)
        {
            var query = new GetFamilyUnitQuery(invitationCode, firstName);
            var result = await _dispatcher.GetAsync<GetFamilyUnitQuery, FamilyUnitDto>(query, cancellationToken);

            return Ok(result);
        }
    }
}
