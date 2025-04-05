using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Payments.Contributions.Commands;
using Wedding.Lambdas.Payments.Contributions.Validation;
using Wedding.Lambdas.Payments.Intent.Commands;
using Wedding.Lambdas.Payments.Intent.Validation;
using Wedding.PublicApi.Logic.Services.Auth;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {

        private readonly ILogger<PaymentController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private ILambdaAuthorizer _lambdaAuthorizer;
        private Auth0Configuration _auth0Configuration;

        public PaymentController(
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

        [HttpPost("intent")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(StripePaymentIntentResponseDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<StripePaymentIntentResponseDto>> CreatePaymentIntent(StripePaymentIntentRequestDto request, CancellationToken cancellationToken = default)
        {
#if !DEBUG_ANONYMOUS
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
#endif
            var command = new CreatePaymentIntentCommand(authContext, request.Amount, request.Currency, request.GiftMetaData.GuestEmail, request.GiftMetaData);
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<CreatePaymentIntentCommand, StripePaymentIntentResponseDto>(command, cancellationToken);

            return Ok(result);
        }



        [HttpGet("intent")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(StripePaymentIntentResponseDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<FamilyUnitViewModel>>> GetPaymentIntentStatus(string paymentIntentId, CancellationToken cancellationToken = default)
        {
#if !DEBUG_ANONYMOUS
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
#endif
            var filter = new ContributionQueryFilter();
            var query = new GetPaymentStatusQuery(authContext, paymentIntentId);
            query.Validate();
            var result = await _dispatcher.GetAsync<GetPaymentStatusQuery, StripePaymentIntentResponseDto>(query, cancellationToken);

            return Ok(result);
        }

        [HttpGet("contributions")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<ContributionDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ContributionDto>>> GetContributions(CancellationToken cancellationToken = default)
        {
#if !DEBUG_ANONYMOUS
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);
#endif
            var filter = new ContributionQueryFilter();
            var query = new GetContributionsQuery(authContext, filter);
            query.Validate();
            var result = await _dispatcher.GetAsync<GetContributionsQuery, List<ContributionDto>>(query, cancellationToken);

            return Ok(result);
        }
    }
}
