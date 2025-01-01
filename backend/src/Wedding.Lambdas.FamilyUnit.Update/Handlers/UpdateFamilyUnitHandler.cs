using System;
using System.Collections.Generic;
using System.Runtime.Intrinsics.X86;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Common.Abstractions;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.FamilyUnit.Update.Commands;
using Wedding.Lambdas.FamilyUnit.Update.Validation;

namespace Wedding.Lambdas.FamilyUnit.Update.Handlers
{
    public class UpdateFamilyUnitHandler : IAsyncCommandHandler<UpdateFamilyUnitCommand, FamilyUnitDto>
    {
        private readonly ILogger<UpdateFamilyUnitHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;
        private readonly Lazy<IUspsMailingAddressValidationProvider> _uspsMailingAddressValidationProvider;

        public UpdateFamilyUnitHandler(ILogger<UpdateFamilyUnitHandler> logger, IDynamoDBContext repository, IMapper mapper)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<FamilyUnitDto> ExecuteAsync(UpdateFamilyUnitCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            var familyUnit = command.FamilyUnit;
            
            // TODO where is auth occurring?

            // var partitionKey = DynamoKeys.GetFamilyUnitPartitionKey(command.FamilyUnit.UserInvitationCode.ToUpper());

            //TODO
            // if (command.FamilyUnit.MailingAddress != null && !command.AddressesConfirmed)
            // {
            //     var address = _mapper.Map<AddressDto>(command.FamilyUnit.MailingAddress);
            //     var correctedAddress = await _uspsMailingAddressValidationProvider.Value.ValidateAddress(address);
            //     if (correctedAddress != null)
            //     {
            //         command.FamilyUnit.MailingAddress = correctedAddress;
            //         return familyUnit;
            //         // TODO more thought on validation here
            //     }
            // }

            try
            {
                var familyInfoPartitionKey = DynamoKeys.GetFamilyUnitPartitionKey(command.FamilyUnit.InvitationCode.ToUpper());
                var familyInfoSortKey = DynamoKeys.GetFamilyInfoSortKey();
                
                var existingFamilyUnit = await _repository.LoadAsync<WeddingEntity>(
                    familyInfoPartitionKey, familyInfoSortKey, cancellationToken);
                
                if (existingFamilyUnit == null)
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
                
                        // TODO, move db calls to a provider?
                        var guestPartitionKey = DynamoKeys.GetGuestPartitionKey(command.FamilyUnit.InvitationCode);
                        var guestSortKey = DynamoKeys.GetGuestSortKey(guest.GuestId);
                
                        var existingGuest = await _repository.LoadAsync<WeddingEntity>(
                            guestPartitionKey, guestSortKey, cancellationToken);
                
                        existingGuest.AgeGroup = guest.AgeGroup;

                        if (guest.Rsvp != null)
                        {
                            existingGuest.InvitationResponse = guest.Rsvp.InvitationResponse;
                            existingGuest.SleepPreference = guest.Rsvp.SleepPreference;
                            existingGuest.RsvpWedding = guest.Rsvp.Wedding;
                            existingGuest.RsvpRehearsalDinner = guest.Rsvp.RehearsalDinner;
                            existingGuest.RsvpFourthOfJuly = guest.Rsvp.FourthOfJuly;
                            existingGuest.RsvpBuildWeek = guest.Rsvp.BuildWeek;
                            existingGuest.RsvpNotes = guest.Rsvp.RsvpNotes;
                            existingGuest.ArrivalDate = guest.Rsvp.ArrivalDate;
                        }

                        if (guest.Preferences != null)
                        {
                            existingGuest.PrefMeal = guest.Preferences.Meal;
                            existingGuest.PrefKidsPortion = guest.Preferences.KidsPortion;
                            existingGuest.PrefFoodAllergies = guest.Preferences.FoodAllergies;
                            existingGuest.PrefSpecialAlcoholRequests = guest.Preferences.SpecialAlcoholRequests;
                        }

                        //_mapper.Map(guest, existingGuest);

                        await _repository.SaveAsync(existingGuest, cancellationToken);
                        allGuests.Add(_mapper.Map<GuestDto>(guest));
                    }
                }

                existingFamilyUnit.MailingAddress = familyUnit.MailingAddress;
                existingFamilyUnit.AdditionalAddresses = familyUnit.AdditionalAddresses;
                existingFamilyUnit.InvitationResponseNotes = familyUnit.InvitationResponseNotes;

                _mapper.Map(familyUnit, existingFamilyUnit);
                
                existingFamilyUnit.PotentialHeadCount = familyUnit.CalculateHeadcount();
                
                await _repository.SaveAsync(existingFamilyUnit, cancellationToken);

                return familyUnit;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the family unit.");
                throw new ApplicationException("An error occurred while getting the family unit.", ex);
            }
        }
    }
}
