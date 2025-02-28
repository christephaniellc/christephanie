using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Guest.Patch.Commands;
using Wedding.Lambdas.Guest.Patch.Validation;

namespace Wedding.Lambdas.Guest.Patch.Handlers
{
    public class PatchGuestHandler : IAsyncCommandHandler<PatchGuestCommand, GuestDto>
    {
        private readonly ILogger<PatchGuestHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDbProvider;
        private readonly IMapper _mapper;

        public PatchGuestHandler(ILogger<PatchGuestHandler> logger, IDynamoDBProvider dynamoDbProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDbProvider = dynamoDbProvider;
            _mapper = mapper;
        }

        public async Task<GuestDto> ExecuteAsync(PatchGuestCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation("PatchGuestHandler");
            command.Validate(nameof(command));

            _logger.LogInformation($"Serialized Guest Patch command: {JsonSerializer.Serialize(command)}");

            var existingGuestEntity = await _dynamoDbProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience,
                command.AuthContext.InvitationCode, 
                command.GuestId, 
                cancellationToken);

            if (existingGuestEntity == null)
            {
                throw new UnauthorizedAccessException($"Guest not found: Audience: {command.AuthContext.Audience}, GuestId: {command.GuestId}");
            }

            _logger.LogInformation($"Serialized existing guest: {JsonSerializer.Serialize(existingGuestEntity)}");

            if (command.AgeGroup != null)
            {
                _logger.LogInformation($"Updating age group from '{existingGuestEntity.AgeGroup}' to '{command.AgeGroup}'");
                existingGuestEntity.AgeGroup = command.AgeGroup;
            }

            if (command.Auth0Id != null)
            {
                _logger.LogInformation($"Updating Auth0Id from '{existingGuestEntity.Auth0Id ?? "<empty>"}' to '{command.Auth0Id}'");
                existingGuestEntity.Auth0Id = command.Auth0Id;
            }

            if (command.InvitationResponse != null)
            {
                _logger.LogInformation($"Updating guest.Rsvp.InvitationResponse from '{existingGuestEntity.InvitationResponse}' to '{command.InvitationResponse}'");
                existingGuestEntity.InvitationResponse = command.InvitationResponse.Value;

                if (command.InvitationResponse != InvitationResponseEnum.Pending)
                {
                    _logger.LogInformation($"Invitation Response audit, command.AuthContext.Name: {command.AuthContext.Name ?? "<unknown>"}");
                    existingGuestEntity.InvitationResponseAudit = new LastUpdateAuditDto
                    {
                        LastUpdate = DateTime.UtcNow,
                        Username = command.AuthContext.Name ?? "unknown"
                    }.ToString();
                }
            }

            if (command.Wedding != null)
            {
                _logger.LogInformation($"Updating guest.Rsvp.Wedding from '{existingGuestEntity.RsvpWedding}' to '{command.Wedding}'");
                existingGuestEntity.RsvpWedding = command.Wedding.Value;

                if (command.Wedding != RsvpEnum.Pending)
                {
                    _logger.LogInformation($"RSVP Response audit, command.AuthContext.Name: {command.AuthContext.Name ?? "<unknown>"}");
                    existingGuestEntity.RsvpAudit = new LastUpdateAuditDto
                    {
                        LastUpdate = DateTime.UtcNow,
                        Username = command.AuthContext.Name ?? "unknown"
                    }.ToString();
                }
            }

            if (command.RehearsalDinner != null)
            {
                _logger.LogInformation($"Updating guest.Rsvp.RehearsalDinner from '{existingGuestEntity.RsvpRehearsalDinner}' to '{command.RehearsalDinner}'");
                existingGuestEntity.RsvpRehearsalDinner = command.RehearsalDinner;
            }

            if (command.FourthOfJuly != null)
            {
                _logger.LogInformation($"Updating guest.Rsvp.FourthOfJuly from '{existingGuestEntity.RsvpFourthOfJuly}' to '{command.FourthOfJuly}'");
                existingGuestEntity.RsvpFourthOfJuly = command.FourthOfJuly;
            }

            if (command.RsvpNotes != null)
            {
                _logger.LogInformation($"Updating guest.Rsvp.RsvpNotes from '{existingGuestEntity.RsvpNotes ?? "<empty>"}' to '{command.RsvpNotes}'");
                existingGuestEntity.RsvpNotes = command.RsvpNotes;
            }

            if (command.NotificationPreference != null)
            {
                var previousNotificationPreferences = existingGuestEntity.PrefNotification == null
                    ? "<none>"
                    : JsonSerializer.Serialize(existingGuestEntity.PrefNotification);
                _logger.LogInformation($"Updating guest.Preferences.Notification from '{previousNotificationPreferences}' to '{JsonSerializer.Serialize(command.NotificationPreference)}'");
                existingGuestEntity.PrefNotification = command.NotificationPreference;
            }

            if (command.SleepPreference != null)
            {
                var previousPrefSleep = existingGuestEntity.PrefSleep == null
                    ? "<none>"
                    : existingGuestEntity.PrefSleep.ToString();
                _logger.LogInformation($"Updating guest.Preferences.Sleep from '{previousPrefSleep}' to '{command.SleepPreference.ToString()}'");
                existingGuestEntity.PrefSleep = command.SleepPreference;
            }

            if (command.FoodPreference != null)
            {
                var previousPrefFood = existingGuestEntity.PrefFood == null
                    ? "<none>"
                    : existingGuestEntity.PrefFood.ToString();
                _logger.LogInformation($"Updating guest.Preferences.Food from '{previousPrefFood}' to '{command.FoodPreference.ToString()}'");
                existingGuestEntity.PrefFood = command.FoodPreference;
            }

            if (command.FoodAllergies != null)
            {
                var previousPrefFoodAllergies = existingGuestEntity.PrefFoodAllergies == null
                    ? "<none>"
                    : JsonSerializer.Serialize(existingGuestEntity.PrefFoodAllergies);
                _logger.LogInformation($"Updating guest.Preferences.FoolAllergies from '{previousPrefFoodAllergies}' to '{JsonSerializer.Serialize(command.FoodAllergies)}'");
                existingGuestEntity.PrefFoodAllergies = command.FoodAllergies;
            }

            if (command.Email != null)
            {
                var currentEmail = _mapper.Map<VerifiedDto>(existingGuestEntity.Email);
                if (currentEmail == null || currentEmail.Value != command.Email)
                {
                    _logger.LogInformation($"Updating guest.Email from '{currentEmail?.Value ?? "<empty>"}, verified: {currentEmail?.Verified}' to '{command.Email}'");
                    existingGuestEntity.Email = new VerifiedDto
                    {
                        Value = command.Email,
                        Verified = false
                    }.ToString();
                }
            }

            if (command.Phone != null)
            {
                var currentPhone = _mapper.Map<VerifiedDto>(existingGuestEntity.Phone);
                if (currentPhone == null || currentPhone.Value != command.Phone)
                {
                    _logger.LogInformation($"Updating guest.Phone from '{currentPhone?.Value ?? "<empty>"}, verified: {currentPhone?.Verified}' to '{command.Phone}'");
                    existingGuestEntity.Phone = new VerifiedDto
                    {
                        Value = command.Phone,
                        Verified = false
                    }.ToString();
                }
            }

            _logger.LogInformation("About to save...");

            await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingGuestEntity, cancellationToken);
            _logger.LogInformation("Saved.");

            var result = await _dynamoDbProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience, command.AuthContext.InvitationCode, command.GuestId, cancellationToken);
            _logger.LogInformation($"Got updated existing guest entity: {JsonSerializer.Serialize(result)}");
            return _mapper.Map<GuestDto>(result);
        }
    }
}
