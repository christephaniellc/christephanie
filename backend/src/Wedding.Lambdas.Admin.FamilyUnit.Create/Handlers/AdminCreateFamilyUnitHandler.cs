using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Validation;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Handlers
{
    public class AdminCreateFamilyUnitHandler : 
        IAsyncCommandHandler<AdminCreateFamilyUnitsCommand, List<FamilyUnitDto>>
    {
        private readonly ILogger<AdminCreateFamilyUnitHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public AdminCreateFamilyUnitHandler(ILogger<AdminCreateFamilyUnitHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<List<FamilyUnitDto>> ExecuteAsync(AdminCreateFamilyUnitsCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            var familyUnitsCreated = new List<FamilyUnitDto>();

            try
            {
                foreach (var familyUnit in command.FamilyUnits)
                {
                    if (familyUnit == null || string.IsNullOrEmpty(familyUnit.InvitationCode))
                    {
                        throw new Exception($"Invalid unit or no invitation code found on family unit.");
                    }

                    familyUnit.InvitationCode = familyUnit.InvitationCode.ToUpper();

                    if (familyUnit!.Guests != null || !familyUnit.Guests!.Any())
                    {
                        throw new Exception($"No guests in family unit '{familyUnit!.InvitationCode}' found.");
                    }

                    var familyInfoPartitionKey = DynamoKeys.GetPartitionKey(familyUnit.InvitationCode);
                    var familyInfoSortKey = DynamoKeys.GetFamilyInfoSortKey();


                    familyUnit.UnitName = DynamoKeys.GetFamilyUnitName(familyUnit!.Guests![0].FirstName, familyUnit.Guests[0].LastName);

                    var existingFamilyUnit = await _dynamoDBProvider.LoadFamilyUnitOnlyAsync(command.AuthContext.Audience, familyUnit.InvitationCode);

                    if (existingFamilyUnit != null)
                    {
                        _logger.LogWarning($"Family unit with Invitation code '{familyUnit.InvitationCode}' already exists ('{existingFamilyUnit.LastName}'). Skipping create...");
                        continue;
                    }

                    var familyInfo = new WeddingEntity()
                    {
                        PartitionKey = familyInfoPartitionKey,
                        SortKey = familyInfoSortKey,
                        InvitationCode = familyUnit.InvitationCode,
                        UnitName = familyUnit.UnitName,
                        Tier = familyUnit.Tier,
                        PotentialHeadCount = familyUnit.CalculateHeadcount()
                    };
                    await _dynamoDBProvider.SaveAsync(command.AuthContext.Audience, familyInfo, cancellationToken);

                    var addedGuests = new List<GuestDto>();
                    var guestNumber = 1;
                    if (familyUnit.Guests != null)
                    {
                        foreach (var guest in familyUnit.Guests)
                        {
                            guest.GuestId = string.IsNullOrEmpty(guest.GuestId) ? Guid.NewGuid().ToString() : guest.GuestId;
                            guest.GuestNumber = guestNumber++;
                            var partitionKey = DynamoKeys.GetPartitionKey(familyUnit.InvitationCode);
                            var guestSortKey = DynamoKeys.GetGuestSortKey(guest.GuestId);
                            AddDefaultRolesIfEmpty(guest);

                            var guestEntity = new WeddingEntity()
                            {
                                PartitionKey = partitionKey,
                                SortKey = guestSortKey,
                                InvitationCode = familyUnit.InvitationCode,
                                GuestId = guest.GuestId,
                                GuestNumber = guest.GuestNumber,
                                Tier = familyUnit.Tier,
                                FirstName = guest.FirstName,
                                AdditionalFirstNames = guest.AdditionalFirstNames,
                                LastName = guest.LastName,
                                Roles = guest.Roles,
                                Email = guest.Email?.ToString() ?? null,
                                Phone = guest.Phone?.ToString() ?? null,
                                AgeGroup = guest.AgeGroup,
                                InvitationResponse = InvitationResponseEnum.Pending
                            };
                            await _dynamoDBProvider.SaveAsync(command.AuthContext.Audience, guestEntity, cancellationToken);
                            addedGuests.Add(_mapper.Map<GuestDto>(guestEntity));
                        }
                    }

                    familyUnit.Guests = addedGuests;
                    familyUnitsCreated.Add(familyUnit);
                }

                return familyUnitsCreated;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while saving the family unit.");
                throw new ApplicationException("An error occurred while saving the family unit.", ex);
            }
        }

        public void AddDefaultRolesIfEmpty(GuestDto guest)
        {
            if (guest.Roles is null || guest.Roles.Count == 0)
            {
                guest.Roles = new List<RoleEnum> { RoleEnum.Guest };
            }
        }
    }
}
