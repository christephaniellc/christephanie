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
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Validation;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Handlers
{
    public class AdminCreateFamilyUnitHandler : 
        IAsyncCommandHandler<AdminCreateFamilyUnitCommand, FamilyUnitDto>
        //, IAsyncCommandHandler<CreateFamilyUnitsCommand, FamilyUnitDto>
    {
        private readonly ILogger<AdminCreateFamilyUnitHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;

        public AdminCreateFamilyUnitHandler(ILogger<AdminCreateFamilyUnitHandler> logger, IDynamoDBContext repository, IMapper mapper)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<FamilyUnitDto> ExecuteAsync(AdminCreateFamilyUnitCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));

            try
            {
                var familyUnit = command.FamilyUnit;
                familyUnit.InvitationCode = familyUnit.InvitationCode.ToUpper();

                var familyInfoPartitionKey = DynamoKeys.GetFamilyUnitPartitionKey(familyUnit.InvitationCode);
                var familyInfoSortKey = DynamoKeys.GetFamilyInfoSortKey();
                familyUnit.UnitName = DynamoKeys.GetFamilyUnitName(familyUnit.Guests[0].FirstName, familyUnit.Guests[0].LastName);

                var existingFamilyUnit = await _repository.LoadAsync<WeddingEntity>(
                    familyInfoPartitionKey, familyInfoSortKey, cancellationToken);

                if (existingFamilyUnit != null)
                {
                    throw new InvalidOperationException($"Family unit with RSVP code '{familyUnit.InvitationCode}' already exists.");
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
                await _repository.SaveAsync(familyInfo, cancellationToken);

                var addedGuests = new List<GuestDto>();
                var guestNumber = 1;
                if (familyUnit.Guests != null)
                {
                    foreach (var guest in familyUnit.Guests)
                    {
                        guest.GuestId = Guid.NewGuid().ToString();
                        guest.GuestNumber = guestNumber++;
                        var guestPartitionKey = DynamoKeys.GetGuestPartitionKey(familyUnit.InvitationCode);
                        var guestSortKey = DynamoKeys.GetGuestSortKey(guest.GuestId);
                        AddDefaultRoles(guest);
                        
                        var guestEntity = new WeddingEntity()
                        {
                            PartitionKey = guestPartitionKey,
                            SortKey = guestSortKey,
                            InvitationCode = familyUnit.InvitationCode,
                            GuestId = guest.GuestId,
                            GuestNumber = guest.GuestNumber,
                            Tier = familyUnit.Tier,
                            FirstName = guest.FirstName,
                            LastName = guest.LastName,
                            Roles = guest.Roles,
                            Email = guest.Email,
                            Phone = guest.Phone,
                            AgeGroup = guest.AgeGroup,
                            InvitationResponse = InvitationResponseEnum.Pending
                        };
                        await _repository.SaveAsync(guestEntity, cancellationToken);
                        addedGuests.Add(_mapper.Map<GuestDto>(guestEntity));
                    }
                }

                familyUnit.Guests = addedGuests;
                return familyUnit;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while saving the family unit.");
                throw new ApplicationException("An error occurred while saving the family unit.", ex);
            }
        }

        public void AddDefaultRoles(GuestDto guest)
        {
            if (guest.Roles is null || guest.Roles.Count == 0)
            {
                guest.Roles = new List<RoleEnum> { RoleEnum.Guest };
            }
        }
    }
}
