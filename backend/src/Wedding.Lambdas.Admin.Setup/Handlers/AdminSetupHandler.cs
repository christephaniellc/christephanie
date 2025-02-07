using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Admin.Setup.Commands;
using Wedding.Lambdas.User.Find.Validation;

namespace Wedding.Lambdas.Admin.Setup.Handlers
{
    public class AdminSetupHandler : IAsyncCommandHandler<AdminSetupCommand, List<FamilyUnitDto>>
    {
        private readonly ILogger<AdminSetupHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public AdminSetupHandler(ILogger<AdminSetupHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<List<FamilyUnitDto>> ExecuteAsync(AdminSetupCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            var familyUnitsCreated = new List<FamilyUnitDto>(); 
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };

            try
            {
                var s3Client = new AmazonS3Client();
                var request = new GetObjectRequest
                {
                    BucketName = "christephanie-wedding-setup",
                    Key = "Data/platinum-plus.json"
                };

                List<FamilyUnitDto>? familyUnitDtos;
                using (var response = await s3Client.GetObjectAsync(request))
                using (var reader = new StreamReader(response.ResponseStream))
                {
                    var entityJson = reader.ReadToEnd();
                    familyUnitDtos = JsonSerializer.Deserialize<List<FamilyUnitDto>>(entityJson, jsonOptions);
                }

                if (familyUnitDtos == null)
                {
                    throw new ValidationException("Could not read family units.");
                } 

                if (familyUnitDtos.FirstOrDefault(x =>
                        x.InvitationCode.Equals(command.InvitationCode, StringComparison.OrdinalIgnoreCase) &&
                        (x.Guests ?? new List<GuestDto>()).Any(g =>
                            g.FirstName.Equals(command.FirstName, StringComparison.OrdinalIgnoreCase))) == null)

                {
                    throw new KeyNotFoundException($"Could not setup admin for invitation code {command.InvitationCode} and first name {command.FirstName}.");
                }

                foreach (var familyUnit in familyUnitDtos)
                {
                    familyUnit.InvitationCode = familyUnit.InvitationCode.ToUpper();
                    if (!familyUnit.Guests?.Any() ?? true)
                    {
                        throw new ValidationException($"Could not read guests in family unit {familyUnit.InvitationCode}");
                    }

                    var familyInfoPartitionKey = DynamoKeys.GetPartitionKey(familyUnit.InvitationCode);
                    var familyInfoSortKey = DynamoKeys.GetFamilyInfoSortKey();
                    familyUnit.UnitName = DynamoKeys.GetFamilyUnitName(familyUnit.Guests![0].FirstName, familyUnit.Guests[0].LastName);

                    var existingFamilyUnit = await _dynamoDBProvider.LoadFamilyUnitOnlyAsync(command.Audience, familyUnit.InvitationCode);
                    
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
                    await _dynamoDBProvider.SaveAsync(command.Audience, familyInfo, cancellationToken);

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
                            //AddDefaultRolesIfEmpty(guest);

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
                                Email = guest.Email,
                                Phone = guest.Phone,
                                AgeGroup = guest.AgeGroup,
                                InvitationResponse = InvitationResponseEnum.Pending
                            };
                            await _dynamoDBProvider.SaveAsync(command.Audience, guestEntity, cancellationToken);
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
    }
}
