using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Amazon.SimpleSystemsManagement.Model;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Validate.Email.Commands;
using Wedding.Lambdas.Validate.Email.Requests;
using Wedding.Lambdas.Validate.Email.Validation;
using ValidationException = FluentValidation.ValidationException;

namespace Wedding.Lambdas.Validate.Email.Handlers
{
    public class EmailValidationHandler : 
        IAsyncCommandHandler<RegisterEmailCommand, ValidateEmailResponse>,
        IAsyncCommandHandler<ResendEmailCodeCommand, ValidateEmailResponse>,
        IAsyncCommandHandler<ValidateEmailCommand, ValidateEmailResponse>
    {
        private readonly ILogger<EmailValidationHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDbProvider;
        private readonly IMapper _mapper;
        //private readonly IAwsSmsHelper _awsSmsHelper;
        private readonly ITwilioSmsProvider _twilioSmsProvider;

        public EmailValidationHandler(ILogger<EmailValidationHandler> logger,
            IDynamoDBProvider dynamoDbProvider,
            IMapper mapper, 
            ITwilioSmsProvider twilioSmsProvider)
        {
            _logger = logger;
            _dynamoDbProvider = dynamoDbProvider;
            _mapper = mapper;
            _twilioSmsProvider = twilioSmsProvider;
        }

        public async Task<ValidateEmailResponse> ExecuteAsync(RegisterEmailCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation($"Raw Query: {JsonSerializer.Serialize(command)}");

            var isRateLimited = await _dynamoDbProvider.CheckRateLimitAsync(command.AuthContext.Audience,
                command.AuthContext.IpAddress,
                "/validate/phone",
                cancellationToken: cancellationToken);

            if (isRateLimited)
            {
                _logger.LogWarning($"Rate limit exceeded for {command.AuthContext.IpAddress}");
                throw new TooManyUpdatesException($"Too many requests for IP '{command.AuthContext.IpAddress}'");
            }
            _logger.LogInformation($"IP {command.AuthContext.IpAddress} NOT rate limited.");

            try
            {
                command.Validate(nameof(command));
            }
            catch (ValidationException ex)
            {
                // If phone number is coming in masked, may fail validation step. Load existing phone number if masked
                if (ex.Message.Contains("Invalid email") && command.Email.ToLower().Contains("***"))
                {
                    var existingGuest = await _dynamoDbProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience,
                        command.AuthContext.InvitationCode, command.AuthContext.GuestId, cancellationToken);
                    if (existingGuest == null || existingGuest.Email == null)
                    {
                        _logger.LogWarning("Invalid email, and saved guest phone information not found.");
                        throw;
                    }

                    var savedEmail = _mapper.Map<VerifiedDto>(existingGuest.Email).Value;
                    if (string.IsNullOrEmpty(savedEmail))
                    {
                        _logger.LogWarning("Invalid email, and saved guest phone number not found.");
                        throw;
                    }

                    command = command with { Email = savedEmail };
                }
                else
                {
                    throw;
                }
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

            var verifyEmail = !string.IsNullOrEmpty(existingGuestEntity.Email)
                ? _mapper.Map<VerifiedDto>(existingGuestEntity.Email)
                : new VerifiedDto
                {
                    Value = command.Email,
                    Verified = false,
                    VerificationCode = VerificationCodeHelper.GenerateCode(),
                    VerificationCodeExpiration = VerificationCodeHelper.GenerateExpiry()
                };

            existingGuestEntity.Email = verifyEmail.ToString();

            await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingGuestEntity, cancellationToken);

            // TODO SKS: use Amazon SMS
            //var message = $"Your Christephanie wedding phone verification code is: {verifyPhone.VerificationCode}";
            //var sendOtpResponse = await _twilioSmsProvider.SendOTPCode(verifyEmail!.Value);
            //var awsResponse = await _awsSmsHelper.SendVerificationCode(command.PhoneNumber, message);

            return new ValidateEmailResponse
            {
                VerifiedStatus = null,
                EmailVerifyState = verifyEmail
            };
        }

        public async Task<ValidateEmailResponse> ExecuteAsync(ResendEmailCodeCommand command, CancellationToken cancellationToken = default(CancellationToken))
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

            var phoneNumber = JsonSerializer.Deserialize<VerifiedDto>(existingGuestEntity.Phone)?.Value;
            if (phoneNumber == null)
            {
                throw new ValidationException($"Phone is null or empty.");
            }

            var register = new RegisterEmailCommand(command.AuthContext, phoneNumber);
            return await ExecuteAsync(register, cancellationToken);
        }

        public async Task<ValidateEmailResponse> ExecuteAsync(ValidateEmailCommand command, CancellationToken cancellationToken = default(CancellationToken))
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

            if (string.IsNullOrEmpty(existingGuestEntity.Phone))
            {
                throw new ValidationException($"Phone is null or empty.");
            }

            var expectedValidation = _mapper.Map<VerifiedDto>(existingGuestEntity.Phone);

            if (expectedValidation == null)
            {
                throw new ValidationException($"Bad validation state.");
            }

            var validated = expectedValidation?.Verified ?? false;
            var phone = expectedValidation!.Value ?? string.Empty;
            if (validated)
            {
                return new ValidateEmailResponse
                {
                    EmailVerifyState = expectedValidation!
                };
            }

            _logger.LogInformation("Phone not yet verified. Checking Twilio for verification...");
            var twilioVerified = await _twilioSmsProvider.CheckVerification(phone, command.Code);
            _logger.LogInformation($"Phone: {phone}. Code: {command.Code}. Verified? {twilioVerified}");

            // Only update if newly verified
            if (twilioVerified)
            {
                var verified = new VerifiedDto
                {
                    Value = phone,
                    Verified = true,
                    VerificationCode = null,
                    VerificationCodeExpiration = null
                };
                existingGuestEntity.Phone = verified.ToString();

                await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingGuestEntity, cancellationToken);

                return new ValidateEmailResponse
                {
                    EmailVerifyState = verified
                };
            }

            // var expectedCode = expectedValidation?.VerificationCode?.ToString() ?? null;
            // var expiry = expectedValidation?.VerificationCodeExpiration ?? null;
            //
            // if (expectedValidation == null
            //     || expectedCode == null 
            //     || expiry == null
            //     || expiry.Value < DateTime.UtcNow)
            // {
            //     throw new ValidationException($"Bad validation state.");
            // }

            // if (command.Code.ToLower() == expectedCode.ToLower()
            //     && expiry.Value > DateTime.UtcNow)
            // {
            //     var verified = new VerifiedDto
            //     {
            //         Verified = true,
            //         VerificationCode = null,
            //         VerificationCodeExpiration = null
            //     };
            //     existingGuestEntity.Phone = verified.ToString();
            //
            //     await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingGuestEntity, cancellationToken);
            //
            //     return new ValidatePhoneResponse
            //     {
            //         PhoneVerifyState = verified
            //     };
            // }

            throw new ValidationException("Invalid verification code.");
        }
    }
}
