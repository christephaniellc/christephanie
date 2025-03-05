using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Guest.MaskedValues.Get.Commands;
using Wedding.Lambdas.Guest.MaskedValues.Get.Requests;
using Wedding.Lambdas.Guest.MaskedValues.Get.Validation;
using Wedding.Lambdas.Guest.Patch.Commands;
using Wedding.Lambdas.Guest.Patch.Requests;
using Wedding.Lambdas.Guest.Patch.Validation;
using Wedding.PublicApi.Logic.Services.Auth;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/guest")] // Route prefix: /api/adminfamilyunit
    public class GuestController : ControllerBase
    {
        private readonly IControllerDispatcher _dispatcher;
        private ILambdaAuthorizer _lambdaAuthorizer;
        private Auth0Configuration _auth0Configuration;

        public GuestController(IControllerDispatcher dispatcher, Auth0Configuration auth0Configuration, ILambdaAuthorizer lambdaAuthorizer)
        {
            _dispatcher = dispatcher;
            _lambdaAuthorizer = lambdaAuthorizer;
            _auth0Configuration = auth0Configuration;
        }

        [Authorize]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<string>> GetGuestMaskedValues([FromBody] GetGuestMaskedValuesRequest getRequest, CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var command = new GetMaskedValueCommand(
                authContext,
                getRequest.GuestId,
                getRequest.MaskedValueType
            );
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<GetMaskedValueCommand, string>(command, cancellationToken);

            return Ok(result);
        }

        [Authorize]
        [HttpPatch]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GuestViewModel))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GuestViewModel>> PatchGuest([FromBody] PatchGuestRequest patchRequest, CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var command = new PatchGuestCommand(
                authContext,
                patchRequest.GuestId,
                patchRequest.AgeGroup,
                patchRequest.Auth0Id,
                patchRequest.Email,
                patchRequest.Phone,
                patchRequest.InvitationResponse,
                patchRequest.RehearsalDinner,
                patchRequest.FourthOfJuly,
                patchRequest.Wedding,
                patchRequest.RsvpNotes,
                patchRequest.NotificationPreference,
                patchRequest.SleepPreference,
                patchRequest.FoodPreference,
                patchRequest.FoodAllergies
            );
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<PatchGuestCommand, GuestDto>(command, cancellationToken);

            return Ok(result);
        }
    }
}
