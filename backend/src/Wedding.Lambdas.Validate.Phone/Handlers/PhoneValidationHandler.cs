using System.Text.Json;
using System;
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
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Validate.Phone.Providers;
using Wedding.Lambdas.Validate.Phone.Requests;
using ValidationException = FluentValidation.ValidationException;

namespace Wedding.Lambdas.Validate.Phone.Handlers
{
    public class PhoneValidationHandler : 
        IAsyncCommandHandler<RegisterPhoneCommand, ValidatePhoneResponse>,
        IAsyncCommandHandler<ResendCodeCommand, ValidatePhoneResponse>,
        IAsyncCommandHandler<ValidatePhoneCommand, ValidatePhoneResponse>
    {
        private readonly ILogger<PhoneValidationHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDbProvider;
        private readonly IMapper _mapper;
        //private readonly IAwsSmsHelper _awsSmsHelper;
        private readonly ITwilioSmsProvider _twilioSmsProvider;

        public PhoneValidationHandler(ILogger<PhoneValidationHandler> logger,
            IDynamoDBProvider dynamoDbProvider,
            IMapper mapper, 
            ITwilioSmsProvider twilioSmsProvider)
        {
            _logger = logger;
            _dynamoDbProvider = dynamoDbProvider;
            _mapper = mapper;
            _twilioSmsProvider = twilioSmsProvider;
        }

        public async Task<ValidatePhoneResponse> ExecuteAsync(RegisterPhoneCommand command, CancellationToken cancellationToken = default(CancellationToken))
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
                if (ex.Message.Contains("Invalid phone number") && command.PhoneNumber.ToLower().Contains("xxx"))
                {
                    var existingGuest = await _dynamoDbProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience,
                        command.AuthContext.InvitationCode, command.AuthContext.GuestId, cancellationToken);
                    if (existingGuest == null || existingGuest.Phone == null)
                    {
                        _logger.LogWarning("Invalid phone number, and saved guest phone information not found.");
                        throw;
                    }

                    var savedPhoneNumber = _mapper.Map<VerifiedDto>(existingGuest.Phone).Value;
                    if (string.IsNullOrEmpty(savedPhoneNumber))
                    {
                        _logger.LogWarning("Invalid phone number, and saved guest phone number not found.");
                        throw;
                    }

                    command = command with { PhoneNumber = savedPhoneNumber };
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

            var verifyPhone = !string.IsNullOrEmpty(existingGuestEntity.Phone)
                ? _mapper.Map<VerifiedDto>(existingGuestEntity.Phone)
                : new VerifiedDto
                {
                    Value = command.PhoneNumber,
                    Verified = false,
                    VerificationCode = VerificationCodeProvider.GenerateCode(),
                    VerificationCodeExpiration = VerificationCodeProvider.GenerateExpiry()
                };

            existingGuestEntity.Phone = verifyPhone.ToString();

            await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingGuestEntity, cancellationToken);

            //var message = $"Your Christephanie wedding phone verification code is: {verifyPhone.VerificationCode}";
            var sendOtpResponse = await _twilioSmsProvider.SendOTPCode(verifyPhone!.Value);
            //var awsResponse = await _awsSmsHelper.SendVerificationCode(command.PhoneNumber, message);

            return new ValidatePhoneResponse
            {
                VerifiedStatus = sendOtpResponse,
                PhoneVerifyState = verifyPhone
            };
        }

        public async Task<ValidatePhoneResponse> ExecuteAsync(ResendCodeCommand command, CancellationToken cancellationToken = default(CancellationToken))
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

            var register = new RegisterPhoneCommand(command.AuthContext, phoneNumber);
            return await ExecuteAsync(register, cancellationToken);
        }

        public async Task<ValidatePhoneResponse> ExecuteAsync(ValidatePhoneCommand command, CancellationToken cancellationToken = default(CancellationToken))
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
                return new ValidatePhoneResponse
                {
                    PhoneVerifyState = expectedValidation!
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

                return new ValidatePhoneResponse
                {
                    PhoneVerifyState = verified
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
