using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
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

            var partitionKey = DynamoKeys.GetFamilyUnitPartitionKey(command.FamilyUnit.InvitationCode);

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
                var familyInfoPartitionKey = DynamoKeys.GetFamilyUnitPartitionKey(command.FamilyUnit.InvitationCode);
                var familyInfoSortKey = DynamoKeys.GetFamilyInfoSortKey();
                
                var existingFamilyUnit = await _repository.LoadAsync<WeddingEntity>(
                    familyInfoPartitionKey, familyInfoSortKey, cancellationToken);
                
                if (existingFamilyUnit == null)
                {
                    throw new InvalidOperationException($"Family unit with RSVP code '{command.FamilyUnit.InvitationCode}' does not exist.");
                }
                
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
                
                        _mapper.Map(guest, existingGuest);
                        await _repository.SaveAsync(existingGuest, cancellationToken);
                        allGuests.Add(_mapper.Map<GuestDto>(guest));
                    }
                }
                
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
