using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Configuration;
using Wedding.Common.Dispatchers;
using Wedding.PublicApi.Logic.Services.Auth;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Notify.Email.Commands;
using Wedding.Lambdas.Notify.Email.Validation;
using System.Collections.Generic;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.ViewModels;
using Wedding.Lambdas.Payments.Contributions.Commands;
using Wedding.Lambdas.Payments.Intent.Commands;
using Wedding.Abstractions.Enums;
using Wedding.Lambdas.Payments.Intent.Validation;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/notify")]
    public class NotificationController : ControllerBase
    {

        private readonly ILogger<PaymentController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private ILambdaAuthorizer _lambdaAuthorizer;
        private Auth0Configuration _auth0Configuration;

        public NotificationController(
            ILogger<PaymentController> logger,
            IConfiguration configuration,
            IControllerDispatcher dispatcher,
            ILambdaAuthorizer lambdaAuthorizer)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _lambdaAuthorizer = lambdaAuthorizer;
            _auth0Configuration = configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
        }

        [HttpPost("email")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<GuestEmailLogDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<GuestEmailLogDto>>> SendNotificationEmails(string guestId, CancellationToken cancellationToken = default)
        {
#if !DEBUG_ANONYMOUS
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
#endif
            var command = new SendRsvpNotificationCommand(authContext, guestId);
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<SendRsvpNotificationCommand, List<GuestEmailLogDto>>(command, cancellationToken);

            return Ok(result);
        }

        [HttpGet("email")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Dictionary<CampaignTypeEnum, GuestEmailLogDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<Dictionary<CampaignTypeEnum, GuestEmailLogDto>>> GetNotificationList(CancellationToken cancellationToken = default)
        {
#if !DEBUG_ANONYMOUS
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
#endif
            var query = new GetEmailNotificationsQuery(authContext);
            query.Validate();
            var result = await _dispatcher.GetAsync<GetEmailNotificationsQuery, Dictionary<CampaignTypeEnum, GuestEmailLogDto>>(query, cancellationToken);

            return Ok(result);
        }
    }
}
