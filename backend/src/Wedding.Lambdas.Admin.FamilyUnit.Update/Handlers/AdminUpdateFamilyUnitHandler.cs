using System;
using System.Collections.Generic;
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
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Validation;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers
{
    public class AdminUpdateFamilyUnitHandler : IAsyncCommandHandler<AdminUpdateFamilyUnitCommand, FamilyUnitDto>
    {
        private readonly ILogger<AdminUpdateFamilyUnitHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;

        public AdminUpdateFamilyUnitHandler(ILogger<AdminUpdateFamilyUnitHandler> logger, IDynamoDBContext repository, IMapper mapper)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<FamilyUnitDto> ExecuteAsync(AdminUpdateFamilyUnitCommand command,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            var familyUnit = command.FamilyUnit;

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

                var addedGuests = new List<GuestDto>();
                if (familyUnit.Guests != null)
                {
                    foreach (var guest in familyUnit.OrderedGuests())
                    {
                        guest.InvitationCode = command.FamilyUnit.InvitationCode;

                        // TODO, move db calls to a provider?
                        var guestPartitionKey = DynamoKeys.GetGuestPartitionKey(command.FamilyUnit.InvitationCode);
                        var guestSortKey = DynamoKeys.GetGuestSortKey(guest.GuestId);

                        var existingGuest = await _repository.LoadAsync<WeddingEntity>(
                            guestPartitionKey, guestSortKey, cancellationToken);

                        _mapper.Map(guest, existingGuest);
                        //_mapper.Map(existingGuest, guest);
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
