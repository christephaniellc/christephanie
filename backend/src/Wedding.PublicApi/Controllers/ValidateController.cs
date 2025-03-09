using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.PublicApi.Logic.Services.Auth;
using Wedding.Lambdas.Validate.Address.Commands;
using Wedding.Lambdas.Validate.Address.Validation;
using Wedding.Lambdas.Validate.Phone.Commands;
using Wedding.Lambdas.Validate.Phone.Requests;
using Wedding.Lambdas.Validate.Phone.Validation;

namespace Wedding.PublicApi.Controllers
{
    [ApiController]
    [Route("api/validate")]
    public class ValidateController : ControllerBase
    {
        private readonly ILogger<ValidateController> _logger;
        private readonly IControllerDispatcher _dispatcher;
        private readonly IServiceProvider _serviceProvider;
        private ILambdaAuthorizer _lambdaAuthorizer;
        private Auth0Configuration _auth0Configuration; public ValidateController(ILogger<ValidateController> logger,
            IControllerDispatcher dispatcher,
            IServiceProvider serviceProvider,
            IConfiguration configuration,
            ILambdaAuthorizer lambdaAuthorizer)
        {
            _logger = logger;
            _dispatcher = dispatcher;
            _serviceProvider = serviceProvider;
            _lambdaAuthorizer = lambdaAuthorizer;
            _auth0Configuration = configuration.GetSection(ConfigurationKeys.Auth0).Get<Auth0Configuration>()!;
        }

        [Authorize]
        [HttpPost("address")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AddressDto))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<AddressDto>> ValidateAddress(AddressDto address, CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var command = new ValidateUspsAddressQuery(address);
            command.Validate();
            var result = await _dispatcher.GetAsync<ValidateUspsAddressQuery, AddressDto>(command, cancellationToken);

            return Ok(result);
        }

        [Authorize]
        [HttpPost("phone/register")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ValidatePhoneResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ValidatePhoneResponse>> RegisterPhone(string phoneNumber, CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var command = new RegisterPhoneCommand(authContext, phoneNumber);
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<RegisterPhoneCommand, ValidatePhoneResponse>(command, cancellationToken);

            return Ok(result);
        }

        [Authorize]
        [HttpPatch("phone/validate")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ValidatePhoneResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ValidatePhoneResponse>> ValidatePhone(string code, CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var command = new ValidatePhoneCommand(authContext, code);
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<ValidatePhoneCommand, ValidatePhoneResponse>(command, cancellationToken);

            return Ok(result);
        }

        [Authorize]
        [HttpPost("phone/resend")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ValidatePhoneResponse))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ValidatePhoneResponse>> ResendPhoneCode(CancellationToken cancellationToken = default)
        {
            var token = HeaderHelper.GetToken(HttpContext.Request.Headers);
            var ipAddress = HeaderHelper.GetIpAddress(HttpContext)!;
            var authRequest = new ValidateAuthQuery(_auth0Configuration.Authority ?? string.Empty, _auth0Configuration.Audience ?? string.Empty,
                LambdaArns.AdminFamilyUnitCreate, ipAddress, token);
            var authContext = await _lambdaAuthorizer.GetAsync(authRequest, cancellationToken);

            var command = new ResendPhoneCodeCommand(authContext);
            command.Validate();
            var result = await _dispatcher.ExecuteAsync<ResendPhoneCodeCommand, ValidatePhoneResponse>(command, cancellationToken);

            return Ok(result);
        }
    }
}
