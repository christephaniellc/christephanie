using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.FamilyUnit.Update.Commands;
using Wedding.Lambdas.FamilyUnit.Update.Validation;

namespace Wedding.Lambdas.FamilyUnit.Update.Handlers
{
    public class UpdateFamilyUnitHandler : IAsyncCommandHandler<UpdateFamilyUnitCommand, FamilyUnitDto>
    {
        private readonly ILogger<UpdateFamilyUnitHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDbProvider;
        private readonly IMapper _mapper;
        private readonly Lazy<IUspsMailingAddressValidationProvider> _uspsMailingAddressValidationProvider;

        public UpdateFamilyUnitHandler(ILogger<UpdateFamilyUnitHandler> logger, IDynamoDBProvider dynamoDbProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDbProvider = dynamoDbProvider;
            _mapper = mapper;
        }

        public async Task<FamilyUnitDto> ExecuteAsync(UpdateFamilyUnitCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            var familyUnit = command.FamilyUnit;

            try
            {
                var existingFamilyUnitEntity = await _dynamoDbProvider.LoadFamilyUnitOnlyAsync(command.AuthContext.Audience, command.FamilyUnit.InvitationCode, cancellationToken);
                if (existingFamilyUnitEntity == null)
                {
                    throw new InvalidOperationException($"Family unit with Invitation code '{command.FamilyUnit.InvitationCode}' does not exist.");
                }

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
                            existingGuestEntity.InvitationResponse = guest.Rsvp.InvitationResponse;
                            existingGuestEntity.RsvpWedding = guest.Rsvp.Wedding;
                            existingGuestEntity.RsvpRehearsalDinner = guest.Rsvp.RehearsalDinner;
                            existingGuestEntity.RsvpFourthOfJuly = guest.Rsvp.FourthOfJuly;
                            if (guest.Rsvp.InvitationResponse != InvitationResponseEnum.Pending)
                            {
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
                            existingGuestEntity.RsvpNotes = guest.Rsvp.RsvpNotes;
                        }

                        if (guest.Preferences != null)
                        {
                            existingGuestEntity.PrefSleep = guest.Preferences.SleepPreference;
                            existingGuestEntity.PrefFood = guest.Preferences.FoodPreference;
                            existingGuestEntity.PrefFoodAllergies = guest.Preferences.FoodAllergies;
                        }

                        //_mapper.Map(guest, existingGuest);

                        await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingGuestEntity, cancellationToken);
                        allGuests.Add(_mapper.Map<GuestDto>(existingGuestEntity));
                    }
                }

                existingFamilyUnitEntity.MailingAddress = familyUnit.MailingAddress.ToString();
                existingFamilyUnitEntity.MailingAddressUspsVerified = familyUnit.MailingAddressUspsVerified;
                existingFamilyUnitEntity.AdditionalAddresses = familyUnit.AdditionalAddresses?
                    .Select(address => address.ToString())
                    .ToList() ?? null;
                existingFamilyUnitEntity.InvitationResponseNotes = familyUnit.InvitationResponseNotes;


                _mapper.Map(familyUnit, existingFamilyUnitEntity);

                familyUnit.Guests = allGuests;
                existingFamilyUnitEntity.PotentialHeadCount = familyUnit.CalculateHeadcount();
                
                await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingFamilyUnitEntity, cancellationToken);

                return await _dynamoDbProvider.GetFamilyUnitAsync(command.AuthContext.Audience, command.FamilyUnit.InvitationCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the family unit.");
                throw new ApplicationException("An error occurred while getting the family unit.", ex);
            }
        }
    }
}
