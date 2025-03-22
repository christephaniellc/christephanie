using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.JwtClaim;
using Wedding.Lambdas.Verify.Email.Commands;
using Wedding.Lambdas.Verify.Email.Validation;

namespace Wedding.Lambdas.Verify.Email.Handlers
{
    public class VerifyEmailHandler : IAsyncQueryHandler<VerifyEmailCommand, VerifyEmailResponse>
    {
        private readonly ILogger<VerifyEmailHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;
        private readonly IAwsParameterCacheProvider _awsParameterCacheProvider;

        public VerifyEmailHandler(ILogger<VerifyEmailHandler> logger, 
            IDynamoDBProvider dynamoDBProvider, 
            IMapper mapper, 
            IAwsParameterCacheProvider awsParameterCacheProvider)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
            _awsParameterCacheProvider = awsParameterCacheProvider;
        }

        public async Task<VerifyEmailResponse> GetAsync(VerifyEmailCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (string.IsNullOrEmpty(command.Token))
            {
                throw new ValidationException($"Invalid token.");
            }

            try
            {
                _logger.LogInformation($"Validate Email Token Raw Query: {JsonSerializer.Serialize(command)}");
                _logger.LogInformation($"Validate Email Token: {command.Token}");

                var config = await _awsParameterCacheProvider.GetConfigAsync<ApplicationConfiguration>();
                var decryptedToken = ValidationTokenProvider.DecodeJwtToken(command.Token, config.EncryptionKey);

                var invitationCode = decryptedToken?.Claims.FirstOrDefault(c => c.Type == "invitationCode")?.Value ?? null;
                var guestId = decryptedToken?.Claims.FirstOrDefault(c => c.Type == "guestId")?.Value ?? null;
                var code = decryptedToken?.Claims.FirstOrDefault(c => c.Type == "code")?.Value ?? null;
                var audience = decryptedToken?.Claims.FirstOrDefault(c => c.Type == "jwtAudience")?.Value ?? null;

                if (string.IsNullOrEmpty(invitationCode) || string.IsNullOrEmpty(guestId) ||
                    string.IsNullOrEmpty(code) || string.IsNullOrEmpty(audience))
                {
                    throw new ValidationException("Invalid token.");
                }

                var existingGuestEntity = await _dynamoDBProvider.LoadGuestByGuestIdAsync(audience, invitationCode, guestId, cancellationToken);
                if (existingGuestEntity == null)
                {
                    throw new InvalidOperationException($"Guest with Invitation code '{invitationCode}' and Guest ID '{guestId}' does not exist.");
                }

                _logger.LogInformation($"Table audience: {audience}");
                _logger.LogInformation($"Invitation code: {invitationCode}");
                _logger.LogInformation($"Guest ID: {guestId}");
                _logger.LogInformation($"Found guest: {JsonSerializer.Serialize(existingGuestEntity)}");

                if (string.IsNullOrEmpty(existingGuestEntity.Email))
                {
                    throw new ValidationException($"Email is null or empty.");
                }

                var expectedValidation = _mapper.Map<VerifiedDto>(existingGuestEntity.Email);
                _logger.LogInformation($"Expected validation: {JsonSerializer.Serialize(expectedValidation)}");

                if (expectedValidation == null)
                {
                    throw new ValidationException($"Bad validation state.");
                }

                var validated = expectedValidation?.Verified ?? false;
                var email = expectedValidation!.Value ?? string.Empty;
                if (validated)
                {
                    return new VerifyEmailResponse
                    {
                        EmailVerifyState = expectedValidation!
                    };
                }

                var expectedCode = expectedValidation?.VerificationCode?.ToString() ?? null;
                var expiry = expectedValidation?.VerificationCodeExpiration ?? null;

                if (expectedValidation == null
                    || string.IsNullOrEmpty(email)
                    || expectedCode == null
                    || expiry == null
                    || expiry.Value < DateTime.UtcNow)
                {
                    throw new ValidationException($"Bad validation state.");
                }

                if (code.ToLower() == expectedCode.ToLower()
                    && expiry.Value > DateTime.UtcNow)
                {
                    var verified = new VerifiedDto
                    {
                        Value = email,
                        Verified = true,
                        VerificationCode = null,
                        VerificationCodeExpiration = null
                    };
                    existingGuestEntity.Email = verified.ToString();

                    await _dynamoDBProvider.SaveAsync(audience, existingGuestEntity, cancellationToken);

                    return new VerifyEmailResponse
                    {
                        EmailVerifyState = verified
                    };
                }

                throw new ValidationException("Invalid verification code.");
            }
            catch (ValidationException ex)
            {
                throw new ValidationException(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                throw new KeyNotFoundException(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the user.");
                throw new Exception($"User not found. {ex.Message}");
            }
        }
    }
}
