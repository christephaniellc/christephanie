using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Common.Abstractions;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Handlers
{
    public class CreateFamilyUnitHandler : IAsyncCommandHandler<CreateFamilyUnitCommand, FamilyUnitDto>
    {
        private readonly ILogger<CreateFamilyUnitHandler> _logger;
        private readonly IDynamoDBContext _repository;

        public CreateFamilyUnitHandler(ILogger<CreateFamilyUnitHandler> logger, IDynamoDBContext repository)
        {
            _logger = logger;
            _repository = repository;
        }

        public async Task<FamilyUnitDto> ExecuteAsync(CreateFamilyUnitCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));

            try
            {
                var familyUnit = command.FamilyUnit; 

                var familyInfoPrimaryKey = $"{DynamoKeys.FamilyUnit}#{familyUnit.RsvpCode}";
                var familyInfoSortKey = DynamoKeys.FamilyInfo;

                var existingFamilyUnit = await _repository.LoadAsync<WeddingEntity>(
                    familyInfoPrimaryKey, familyInfoSortKey, cancellationToken);

                if (existingFamilyUnit != null)
                {
                    throw new InvalidOperationException($"Family unit with RSVP code '{familyUnit.RsvpCode}' already exists.");
                }

                familyUnit.RsvpCode = familyUnit.RsvpCode.ToUpper();
                familyUnit.UnitName = $"{familyUnit.Guests[0].LastName}_{familyUnit.Guests[0].FirstName} Family";
                familyUnit.PotentialHeadCount = 0;

                var familyInfo = new WeddingEntity()
                {
                    RsvpCode = $"{DynamoKeys.FamilyUnit}#{familyUnit.RsvpCode}",
                    SortKey = DynamoKeys.FamilyInfo,
                    UnitName = familyUnit.UnitName,
                    Tier = familyUnit.Tier,
                    PotentialHeadCount = familyUnit.Guests.Count,
                    // GuestId = guest.GuestId,
                    // EntityType = DynamoKeys.Guest
                };
                await _repository.SaveAsync(familyInfo, cancellationToken);

                if (familyUnit.Guests != null)
                {
                    foreach (var guest in familyUnit.Guests)
                    {
                        guest.GuestId = Guid.NewGuid().ToString();
                        AddDefaultRoles(guest);
                        
                        var guestEntity = new WeddingEntity()
                        {
                            RsvpCode = $"{DynamoKeys.FamilyUnit}#{familyUnit.RsvpCode}",
                            SortKey = $"{DynamoKeys.Guest}#{++familyUnit.PotentialHeadCount}",
                            GuestId = guest.GuestId,
                            Tier = familyUnit.Tier,
                            FirstName = guest.FirstName,
                            LastName = guest.LastName,
                            Roles = guest.Roles,
                            Email = guest.Email,
                            Phone = guest.Phone,
                            AgeGroup = guest.AgeGroup,
                            InvitationResponse = InvitationResponseEnum.Pending
                            //EntityType = DynamoKeys.Guest
                        };
                        await _repository.SaveAsync(guestEntity, cancellationToken);
                    }
                }
                
                return familyUnit;
                //return _mapper.Map<SiteDto>(site);catch (Exception ex)
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
                guest.Roles = new List<RoleEnum> { RoleEnum.None };
            }
        }
    }
}
