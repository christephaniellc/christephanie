using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Guest.MaskedValues.Get.Commands;
using Wedding.Lambdas.Guest.MaskedValues.Get.Validation;

namespace Wedding.Lambdas.Guest.MaskedValues.Get.Handlers
{
    public class GetGuestMaskedValueHandler : IAsyncCommandHandler<GetMaskedValueCommand, string?>
    {
        private readonly ILogger<GetGuestMaskedValueHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDbProvider;
        private readonly IMapper _mapper;

        public GetGuestMaskedValueHandler(ILogger<GetGuestMaskedValueHandler> logger, IDynamoDBProvider dynamoDbProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDbProvider = dynamoDbProvider;
            _mapper = mapper;
        }

        public async Task<string?> ExecuteAsync(GetMaskedValueCommand command,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation("GetGuestMaskedValueHandler");
            command.Validate(nameof(command));

            _logger.LogInformation($"Serialized GetMaskedValue command: {JsonSerializer.Serialize(command)}");

            var existingGuestEntity = await _dynamoDbProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience,
                command.AuthContext.InvitationCode,
                command.GuestId,
                cancellationToken);

            if (existingGuestEntity == null)
            {
                throw new UnauthorizedAccessException(
                    $"Guest not found: Audience: {command.AuthContext.Audience}, GuestId: {command.GuestId}");
            }

            _logger.LogInformation($"Serialized existing guest: {JsonSerializer.Serialize(existingGuestEntity)}");

            if (command.MaskedValueType == NotificationPreferenceEnum.Email)
            {
                var email = _mapper.Map<VerifiedDto>(existingGuestEntity.Email);
                _logger.LogInformation(
                    $"Getting unmasked email for guest '{existingGuestEntity.FirstName + " " + existingGuestEntity.LastName}': '{email.Value}'");
                return email.Value;
            }

            if (command.MaskedValueType == NotificationPreferenceEnum.Text)
            {
                var phone = _mapper.Map<VerifiedDto>(existingGuestEntity.Phone);
                _logger.LogInformation(
                    $"Getting unmasked phone for guest '{existingGuestEntity.FirstName + " " + existingGuestEntity.LastName}': '{phone.Value}'");
                return phone.Value;
            }

            throw new ValidationException("Invalid mask command");
        }
    }
}
