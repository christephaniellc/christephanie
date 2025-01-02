using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
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
                var familyInfoPartitionKey = DynamoKeys.GetPartitionKey(command.FamilyUnit.InvitationCode);
                var familyInfoSortKey = DynamoKeys.GetFamilyInfoSortKey();

                // var existingFamilyUnit = await _repository.LoadAsync<WeddingEntity>(
                //     familyInfoPartitionKey, familyInfoSortKey, cancellationToken);

                var dynamoQuery = new QueryOperationConfig()
                {
                    KeyExpression = new Expression
                    {
                        ExpressionStatement = "PartitionKey = :pk",
                        ExpressionAttributeValues =
                        {
                            { ":pk", familyInfoPartitionKey },
                        }
                    }
                };

                var results = await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery).GetRemainingAsync();

                var existingFamilyUnit = _mapper.Map<FamilyUnitDto>(results.FirstOrDefault(x => x.SortKey == DynamoKeys.FamilyInfo));
                var existingGuests = results.Where(x => x.SortKey.StartsWith(DynamoKeys.Guest))
                    .Select(x => _mapper.Map<GuestDto>(x))
                    .ToList();

                var guestsToAdd = new List<GuestDto>();
                var guestsToUpdate = new List<GuestDto>();
                var guestsToDelete = new List<GuestDto>();

                var guestsInCommand = _mapper.Map<List<GuestDto>>(familyUnit.OrderedGuests());
                guestsToDelete.AddRange(guestsInCommand);

                if (existingFamilyUnit == null)
                {
                    throw new InvalidOperationException($"Family unit with Invitation code '{command.FamilyUnit.InvitationCode}' does not exist.");
                }

                var addedGuests = new List<GuestDto>();
                if (familyUnit.Guests != null)
                {
                    foreach (var guest in familyUnit.OrderedGuests())
                    {
                        if (existingGuests.Any(g => g.GuestId == guest.GuestId))
                        {
                            guestsToUpdate.Add(guest);
                            guestsToDelete.Remove(guestsToDelete.FirstOrDefault(g => g.GuestId == guest.GuestId));
                        }
                        else
                        {
                            guestsToAdd.Add(guest);
                        }
                    }
                }
                
                foreach (var guest in guestsToDelete)
                {
                    var partitionKey = DynamoKeys.GetPartitionKey(command.FamilyUnit.InvitationCode);
                    var guestSortKey = DynamoKeys.GetGuestSortKey(guest.GuestId);
                    await _repository.DeleteAsync<WeddingEntity>(partitionKey, guestSortKey, cancellationToken);
                }

                foreach (var guest in guestsToUpdate)
                {
                    guest.InvitationCode = command.FamilyUnit.InvitationCode;

                    // TODO, move db calls to a provider?
                    var guestPartitionKey = DynamoKeys.GetPartitionKey(command.FamilyUnit.InvitationCode);
                    var guestSortKey = DynamoKeys.GetGuestSortKey(guest.GuestId);

                    var existingGuest = await _repository.LoadAsync<WeddingEntity>(
                        guestPartitionKey, guestSortKey, cancellationToken);

                    _mapper.Map(guest, existingGuest);
                    //_mapper.Map(existingGuest, guest);
                    await _repository.SaveAsync(existingGuest, cancellationToken);
                    addedGuests.Add(_mapper.Map<GuestDto>(guest));
                }

                foreach (var guest in guestsToAdd)
                {
                    guest.InvitationCode = command.FamilyUnit.InvitationCode;
                    guest.GuestNumber = addedGuests.Count + 1;

                    var entity = _mapper.Map<WeddingEntity>(guest);
                    await _repository.SaveAsync(entity, cancellationToken);
                    addedGuests.Add(_mapper.Map<GuestDto>(guest));
                }

                existingFamilyUnit.Guests = addedGuests;
                //_repository.SaveAsync()

                // var updatedResults = await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery).GetRemainingAsync();
                // var updatedFamilyUnit = _mapper.Map<FamilyUnitDto>(updatedResults.FirstOrDefault(x => x.SortKey == DynamoKeys.FamilyInfo));

                _mapper.Map(familyUnit, existingFamilyUnit);

                existingFamilyUnit.PotentialHeadCount = existingFamilyUnit.CalculateHeadcount();

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
