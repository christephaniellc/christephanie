using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.FamilyUnit.Update.Commands;
using Wedding.Lambdas.FamilyUnit.Update.Validation;

namespace Wedding.Lambdas.FamilyUnit.Update.Handlers
{
    public class UpdateFamilyUnitHandler : IAsyncCommandHandler<UpdateFamilyUnitCommand, FamilyUnitViewModel>
    {
        private readonly ILogger<UpdateFamilyUnitHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDbProvider;
        private readonly IMapper _mapper;

        public UpdateFamilyUnitHandler(ILogger<UpdateFamilyUnitHandler> logger, IDynamoDBProvider dynamoDbProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDbProvider = dynamoDbProvider;
            _mapper = mapper;
        }

        public async Task<FamilyUnitViewModel> ExecuteAsync(UpdateFamilyUnitCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation("UpdateFamilyUnitHandler");
            command.Validate(nameof(command));
            var familyUnit = command.FamilyUnit;

            try
            {
                var existingFamilyUnitEntity = await _dynamoDbProvider.LoadFamilyUnitOnlyAsync(command.AuthContext.Audience, command.FamilyUnit.InvitationCode, cancellationToken);
                if (existingFamilyUnitEntity == null)
                {
                    throw new InvalidOperationException($"Family unit with Invitation code '{command.FamilyUnit.InvitationCode}' does not exist.");
                }

                _logger.LogInformation($"Table audience: {command.AuthContext.Audience}");
                _logger.LogInformation($"Invitation code: {command.FamilyUnit.InvitationCode}");
                _logger.LogInformation($"Found family unit: {JsonSerializer.Serialize(existingFamilyUnitEntity)}");

                // TODO: should only update certain properties, do a patch endpoint, not all guests / properties are included
                var allGuests = new List<GuestDto>();
                if (familyUnit.Guests != null)
                {
                    foreach (var guest in familyUnit!.OrderedGuests()!)
                    {
                        guest.InvitationCode = command.FamilyUnit.InvitationCode;
                        
                        var existingGuestEntity = await _dynamoDbProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience,
                            command.FamilyUnit.InvitationCode, 
                            guest.GuestId, 
                            cancellationToken);
                        
                        existingGuestEntity.AgeGroup = guest.AgeGroup;
                        
                        if (guest.Rsvp != null) 
                        {
                            _logger.LogInformation($"guest.Rsvp.InvitationResponse: {guest.Rsvp.InvitationResponse}");
                            existingGuestEntity.InvitationResponse = guest.Rsvp.InvitationResponse;
                            _logger.LogInformation($"guest.Rsvp.Wedding: {guest.Rsvp.Wedding}");
                            existingGuestEntity.RsvpWedding = guest.Rsvp.Wedding;
                            _logger.LogInformation($"guest.Rsvp.RehearsalDinner: {guest.Rsvp.RehearsalDinner}");
                            existingGuestEntity.RsvpRehearsalDinner = guest.Rsvp.RehearsalDinner;
                            _logger.LogInformation($"guest.Rsvp.FourthOfJuly: {guest.Rsvp.FourthOfJuly}");
                            existingGuestEntity.RsvpFourthOfJuly = guest.Rsvp.FourthOfJuly;

                            if (guest.Rsvp.InvitationResponse != InvitationResponseEnum.Pending)
                            {
                                _logger.LogInformation($"command.AuthContext.Name: {command.AuthContext.Name}");
                                existingGuestEntity.InvitationResponseAudit = new LastUpdateAuditDto
                                {
                                    LastUpdate = DateTime.UtcNow,
                                    Username = command.AuthContext.Name
                                }.ToString();
                            }

                            if (guest.Rsvp.Wedding != RsvpEnum.Pending)
                            {
                                existingGuestEntity.RsvpAudit = new LastUpdateAuditDto
                                {
                                    LastUpdate = DateTime.UtcNow,
                                    Username = command.AuthContext.Name
                                }.ToString();
                            }
                            _logger.LogInformation($"guest.Rsvp.RsvpNotes: {guest.Rsvp.RsvpNotes}");
                            existingGuestEntity.RsvpNotes = guest.Rsvp.RsvpNotes;
                        }

                        if (guest.Preferences != null)
                        {
                            existingGuestEntity.PrefNotification = guest.Preferences.NotificationPreference;
                            existingGuestEntity.PrefSleep = guest.Preferences.SleepPreference;
                            existingGuestEntity.PrefFood = guest.Preferences.FoodPreference;
                            existingGuestEntity.PrefFoodAllergies = guest.Preferences.FoodAllergies;
                        }

                        //_mapper.Map(guest, existingGuest);
                        _logger.LogInformation("About to save...");

                        await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingGuestEntity, cancellationToken);
                        allGuests.Add(_mapper.Map<GuestDto>(existingGuestEntity));
                        _logger.LogInformation("Saved.");
                    }
                }

                _logger.LogInformation($"familyUnit.MailingAddress.ToString(): {familyUnit.MailingAddress?.ToString()}");
                existingFamilyUnitEntity.MailingAddress = familyUnit.MailingAddress?.ToString();
                existingFamilyUnitEntity.AdditionalAddresses = familyUnit.AdditionalAddresses?
                    .Select(address => address.ToString())
                    .ToList() ?? null;
                _logger.LogInformation($"familyUnit.InvitationResponseNotes: {familyUnit.InvitationResponseNotes}");
                existingFamilyUnitEntity.InvitationResponseNotes = familyUnit.InvitationResponseNotes;
                
                _mapper.Map(familyUnit, existingFamilyUnitEntity);

                familyUnit.Guests = allGuests;
                _logger.LogInformation($"familyUnit.CalculateHeadcount(): {familyUnit.CalculateHeadcount()}");
                existingFamilyUnitEntity.PotentialHeadCount = familyUnit.CalculateHeadcount();
                
                await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingFamilyUnitEntity, cancellationToken);
                _logger.LogInformation($"Updated existingFamilyUnitEntity");

                var result = await _dynamoDbProvider.GetFamilyUnitAsync(command.AuthContext.Audience, command.FamilyUnit.InvitationCode);
                _logger.LogInformation($"Got updated existingFamilyUnitEntity: {JsonSerializer.Serialize(result)}");
                return _mapper.Map<FamilyUnitViewModel>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the family unit:" + ex.Message);
                _logger.LogError(ex, "Stacktrace:" + ex.StackTrace);
                throw new ApplicationException("An error occurred while getting the family unit.", ex);
            }
        }
    }
}
