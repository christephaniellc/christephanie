using System.Text.Json;
using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Amazon.SimpleSystemsManagement.Model;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.Lambdas.Validate.Phone.Commands;
using Wedding.Lambdas.Validate.Phone.Validation;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Validate.Phone.Providers;
using ValidationException = Amazon.SimpleNotificationService.Model.ValidationException;

namespace Wedding.Lambdas.Validate.Phone.Handlers
{
    public class PhoneValidationHandler : 
        IAsyncCommandHandler<RegisterPhoneCommand, HttpStatusCode?>,
        IAsyncCommandHandler<ResendCodeCommand, HttpStatusCode?>,
        IAsyncCommandHandler<ValidatePhoneCommand, bool>
    {
        private readonly ILogger<PhoneValidationHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDbProvider;
        private readonly IMapper _mapper;
        private readonly IAwsSmsHelper _awsSmsHelper;

        public PhoneValidationHandler(ILogger<PhoneValidationHandler> logger,
            IDynamoDBProvider dynamoDbProvider,
            IMapper mapper, 
            IAwsSmsHelper awsSmsHelper)
        {
            _logger = logger;
            _dynamoDbProvider = dynamoDbProvider;
            _mapper = mapper;
            _awsSmsHelper = awsSmsHelper;
        }

        public async Task<HttpStatusCode?> ExecuteAsync(RegisterPhoneCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation($"Raw Query: {JsonSerializer.Serialize(command)}");
            command.Validate(nameof(command));

            var isRateLimited = await _dynamoDbProvider.CheckRateLimitAsync(command.AuthContext.Audience, 
                command.AuthContext.IpAddress, 
                "/validate/phone", 
                cancellationToken: cancellationToken);

            if (isRateLimited)
            {
                _logger.LogWarning($"Rate limit exceeded for {command.AuthContext.IpAddress}");
                throw new TooManyUpdatesException($"Too many requests for IP '{command.AuthContext.IpAddress}'");
            }

            var existingGuestEntity = await _dynamoDbProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience, command.AuthContext.InvitationCode, command.AuthContext.GuestId, cancellationToken);
            if (existingGuestEntity == null)
            {
                throw new InvalidOperationException($"Guest with Invitation code '{command.AuthContext.InvitationCode}' and Guest ID '{command.AuthContext.GuestId}' does not exist.");
            }

            _logger.LogInformation($"Table audience: {command.AuthContext.Audience}");
            _logger.LogInformation($"Invitation code: {command.AuthContext.InvitationCode}");
            _logger.LogInformation($"Guest ID: {command.AuthContext.GuestId}");
            _logger.LogInformation($"Found guest: {JsonSerializer.Serialize(existingGuestEntity)}");

            var verifyPhone = string.IsNullOrEmpty(existingGuestEntity.PhoneVerified)
                ? _mapper.Map<VerifyDto>(existingGuestEntity.PhoneVerified)
                : new VerifyDto
                {
                    Verified = false,
                    VerificationCode = VerificationCodeProvider.GenerateCode(),
                    VerificationCodeExpiration = VerificationCodeProvider.GenerateExpiry()
                };

            existingGuestEntity.PhoneVerified = verifyPhone.ToString();
            existingGuestEntity.Phone = command.PhoneNumber;

            await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingGuestEntity, cancellationToken);

            var message = $"Your Christephanie wedding phone verification code is: {verifyPhone.VerificationCode}";
            return await _awsSmsHelper.SendVerificationCode(command.PhoneNumber, message);
        }

        public async Task<HttpStatusCode?> ExecuteAsync(ResendCodeCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation($"Raw Query: {JsonSerializer.Serialize(command)}");
            command.Validate(nameof(command));

            var existingGuestEntity = await _dynamoDbProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience, command.AuthContext.InvitationCode, command.AuthContext.GuestId, cancellationToken);
            if (existingGuestEntity == null || string.IsNullOrEmpty(existingGuestEntity.Phone))
            {
                throw new InvalidOperationException($"Guest with Invitation code '{command.AuthContext.InvitationCode}' and Guest ID '{command.AuthContext.GuestId}' does not exist, or does not have saved phone number.");
            }

            _logger.LogInformation($"Table audience: {command.AuthContext.Audience}");
            _logger.LogInformation($"Invitation code: {command.AuthContext.InvitationCode}");
            _logger.LogInformation($"Guest ID: {command.AuthContext.GuestId}");
            _logger.LogInformation($"Found guest: {JsonSerializer.Serialize(existingGuestEntity)}");

            var register = new RegisterPhoneCommand(command.AuthContext, existingGuestEntity.Phone);
            return await ExecuteAsync(register, cancellationToken);
        }

        public async Task<bool> ExecuteAsync(ValidatePhoneCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation($"Raw Query: {JsonSerializer.Serialize(command)}");
            command.Validate(nameof(command));

            var existingGuestEntity = await _dynamoDbProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience, command.AuthContext.InvitationCode, command.AuthContext.GuestId, cancellationToken);
            if (existingGuestEntity == null)
            {
                throw new InvalidOperationException($"Guest with Invitation code '{command.AuthContext.InvitationCode}' and Guest ID '{command.AuthContext.GuestId}' does not exist.");
            }

            _logger.LogInformation($"Table audience: {command.AuthContext.Audience}");
            _logger.LogInformation($"Invitation code: {command.AuthContext.InvitationCode}");
            _logger.LogInformation($"Guest ID: {command.AuthContext.GuestId}");
            _logger.LogInformation($"Provided code: {command.Code}");
            _logger.LogInformation($"Found guest: {JsonSerializer.Serialize(existingGuestEntity)}");

            var expectedValidation = _mapper.Map<VerifyDto>(existingGuestEntity.PhoneVerified);

            var validated = expectedValidation?.Verified ?? false;
            var expectedCode = expectedValidation?.VerificationCode?.ToString() ?? null;
            var expiry = expectedValidation?.VerificationCodeExpiration ?? null;

            if (expectedValidation == null
                || expectedCode == null 
                || expiry == null
                || expiry.Value < DateTime.UtcNow)
            {
                throw new ValidationException($"Bad validation state.");
            }
            
            if (validated)
            {
                return true;
            }

            if (command.Code.ToLower() == expectedCode.ToLower()
                && expiry.Value > DateTime.UtcNow)
            {
                existingGuestEntity.PhoneVerified = new VerifyDto
                {
                    Verified = true,
                    VerificationCode = null,
                    VerificationCodeExpiration = null
                }.ToString();

                await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingGuestEntity, cancellationToken);

                return true;
            }

            throw new ValidationException("Invalid verification code.");
        }
    }
}
