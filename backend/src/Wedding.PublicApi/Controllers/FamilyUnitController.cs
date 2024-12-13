using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Dispatchers;
using Wedding.Lambdas.FamilyUnit.Get.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Services.Auth;

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
        [HttpGet("{rsvpCode}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FamilyUnitDto))]
        public async Task<ActionResult<FamilyUnitDto>> GetFamilyUnit(string rsvpCode,
            //[FromBody] APIGatewayProxyRequest request //, 
            //  [FromServices] ILambdaContext context
            CancellationToken cancellationToken = default
        )
        {
            var query = new GetFamilyUnitQuery { RsvpCode = rsvpCode };
            var result = await _dispatcher.GetAsync<GetFamilyUnitQuery, FamilyUnitDto>(query, cancellationToken);

            return Ok(result);
        }
    }
}
