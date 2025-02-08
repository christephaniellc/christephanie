using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Validation;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers
{
    public class AdminUpdateFamilyUnitHandler : IAsyncCommandHandler<AdminUpdateFamilyUnitCommand, FamilyUnitDto>
    {
        private readonly ILogger<AdminUpdateFamilyUnitHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public AdminUpdateFamilyUnitHandler(ILogger<AdminUpdateFamilyUnitHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<FamilyUnitDto> ExecuteAsync(AdminUpdateFamilyUnitCommand command,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            var familyUnit = command.FamilyUnit;

            try
            {
                var results = await _dynamoDBProvider.FromQueryAsync(command.AuthContext.Audience, command.FamilyUnit.InvitationCode);

                if (results == null)
                {
                    throw new Exception($"Error loading family. Audience: {command.AuthContext.Audience}, InvitationCode: {command.FamilyUnit.InvitationCode}");
                }

                var existingFamilyUnitEntity = results.FirstOrDefault(x => x.SortKey == DynamoKeys.FamilyInfo);
                var existingFamilyUnit = _mapper.Map<FamilyUnitDto>(existingFamilyUnitEntity);
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
                    foreach (var guest in familyUnit!.OrderedGuests()!)
                    {
                        if (existingGuests.Any(g => g.GuestId == guest.GuestId))
                        {
                            guestsToUpdate.Add(guest);

                            var guestToDelete = guestsToDelete.FirstOrDefault(g => g.GuestId == guest.GuestId);
                            if (guestToDelete != null)
                            {
                                guestsToDelete.Remove(guestToDelete);
                            }
                        }
                        else
                        {
                            guestsToAdd.Add(guest);
                        }
                    }
                }
                
                foreach (var guest in guestsToDelete)
                {
                    var guestSortKey = DynamoKeys.GetGuestSortKey(guest.GuestId);
                    await _dynamoDBProvider.DeleteAsync(command.AuthContext.Audience, command.FamilyUnit.InvitationCode, guestSortKey, cancellationToken);
                }

                foreach (var guest in guestsToUpdate)
                {
                    guest.InvitationCode = command.FamilyUnit.InvitationCode;

                    var existingGuest = await _dynamoDBProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience, 
                        guest.InvitationCode,
                        guest.GuestId, 
                        cancellationToken);

                    _mapper.Map(guest, existingGuest);
                    //_mapper.Map(existingGuest, guest);
                    await _dynamoDBProvider.SaveAsync(command.AuthContext.Audience, existingGuest!, cancellationToken);
                    addedGuests.Add(_mapper.Map<GuestDto>(guest));
                }

                foreach (var guest in guestsToAdd)
                {
                    guest.InvitationCode = command.FamilyUnit.InvitationCode;
                    guest.GuestNumber = addedGuests.Count + 1;

                    var entity = _mapper.Map<WeddingEntity>(guest);
                    await _dynamoDBProvider.SaveAsync(command.AuthContext.Audience, entity, cancellationToken);
                    addedGuests.Add(_mapper.Map<GuestDto>(guest));
                }

                existingFamilyUnit.Guests = addedGuests;
                //_repository.SaveAsync()

                // var updatedResults = await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery).GetRemainingAsync();
                // var updatedFamilyUnit = _mapper.Map<FamilyUnitDto>(updatedResults.FirstOrDefault(x => x.SortKey == DynamoKeys.FamilyInfo));

                _mapper.Map(familyUnit, existingFamilyUnitEntity);

                existingFamilyUnitEntity!.PotentialHeadCount = existingFamilyUnit.CalculateHeadcount();

                await _dynamoDBProvider.SaveAsync(command.AuthContext.Audience, existingFamilyUnitEntity, cancellationToken);
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
