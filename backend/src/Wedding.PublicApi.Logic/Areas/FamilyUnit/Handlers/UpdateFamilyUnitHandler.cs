using System;
using Amazon.DynamoDBv2.DataModel;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Handlers
{
    public class UpdateFamilyUnitHandler : IAsyncCommandHandler<UpdateFamilyUnitCommand, FamilyUnitDto>
    {
        private readonly ILogger<UpdateFamilyUnitHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;

        public UpdateFamilyUnitHandler(ILogger<UpdateFamilyUnitHandler> logger, IDynamoDBContext repository, IMapper mapper)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<FamilyUnitDto> ExecuteAsync(UpdateFamilyUnitCommand command,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            var familyUnit = command.FamilyUnit;

            try
            {
                var familyInfoPartitionKey = DynamoKeys.GetFamilyUnitPartitionKey(command.RsvpCode);
                var familyInfoSortKey = DynamoKeys.GetFamilyInfoSortKey();

                var existingFamilyUnit = await _repository.LoadAsync<WeddingEntity>(
                    familyInfoPartitionKey, familyInfoSortKey, cancellationToken);

                if (existingFamilyUnit == null)
                {
                    throw new InvalidOperationException($"Family unit with RSVP code '{command.RsvpCode}' does not exist.");
                }

                var addedGuests = new List<GuestDto>();
                if (familyUnit.Guests != null)
                {
                    foreach (var guest in familyUnit.OrderedGuests())
                    {
                        // TODO, move db calls to a provider?
                        var guestPartitionKey = DynamoKeys.GetGuestPartitionKey(command.RsvpCode);
                        var guestSortKey = DynamoKeys.GetGuestSortKey(guest.GuestId);

                        var existingGuest = await _repository.LoadAsync<WeddingEntity>(
                            guestPartitionKey, guestSortKey, cancellationToken);

                        _mapper.Map(guest, existingGuest);
                        await _repository.SaveAsync(existingGuest, cancellationToken);
                        addedGuests.Add(_mapper.Map<GuestDto>(guest));
                    }
                }
                
                _mapper.Map(familyUnit, existingFamilyUnit);

                existingFamilyUnit.PotentialHeadCount = familyUnit.CalculateHeadcount();

                await _repository.SaveAsync(existingFamilyUnit, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating the family unit.");
                throw new ApplicationException("An error occurred while updating the family unit.", ex);
            }

            return familyUnit;
        }
    }
}
