using System;
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
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Handlers
{
    public class GetFamilyUnitHandler : IAsyncQueryHandler<GetFamilyUnitQuery, FamilyUnitDto>
    {
        private readonly ILogger<GetFamilyUnitHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;

        public GetFamilyUnitHandler(ILogger<GetFamilyUnitHandler> logger, IDynamoDBContext repository, IMapper mapper)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<FamilyUnitDto> GetAsync(GetFamilyUnitQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            var primaryKey = $"{DynamoKeys.FamilyUnit}#{query.RsvpCode}";

            try
            {
                var dynamoQuery = new QueryOperationConfig()
                {
                    KeyExpression = new Expression
                    {
                        ExpressionStatement = "RsvpCode = :pk",
                        ExpressionAttributeValues =
                        {
                            { ":pk", primaryKey },
                        }
                    }
                }; 

                //var result = await _repository.QueryAsync<WeddingEntity>(primaryKey, dynamoQuery).GetRemainingAsync();
                var result = await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery).GetRemainingAsync();

                if (result == null)
                {
                    _logger.LogError("Family unit with RSVP code '{query.RsvpCode}' not found.");
                    throw new InvalidOperationException($"Family unit with RSVP code '{query.RsvpCode}' not found.");
                }

                var numFamilies = result.Where(f => f.SortKey == DynamoKeys.FamilyInfo).ToList();
                if (numFamilies.Count > 1)
                {
                    _logger.LogError("Multiple family units with RSVP code '{query.RsvpCode}' found.");
                    throw new ApplicationException($"Multiple family units with RSVP code '{query.RsvpCode}' found.");
                }

                // var familyUnitInfo = result.FirstOrDefault(x => x.SortKey == DynamoKeys.FamilyInfo);
                // var guestEntities = result.Where(x => x.SortKey.StartsWith(DynamoKeys.Guest)).ToList();
                
                var familyUnit = _mapper.Map<FamilyUnitDto>(result.FirstOrDefault(x => x.SortKey == DynamoKeys.FamilyInfo));
                var guests = result.Where(x => x.SortKey.StartsWith(DynamoKeys.Guest))
                    .Select(x => _mapper.Map<GuestDto>(x))
                    .ToList();

                if (guests.Count == 0)
                {
                    _logger.LogError("No guests with RSVP code '{query.RsvpCode}' found.");
                    throw new ApplicationException($"Invalid RSVP code '{query.RsvpCode}', no guests found.");
                }

                familyUnit.Guests = guests;

                // var familyUnit = new FamilyUnitDto
                // {
                //     RsvpCode = familyUnitInfo?.RsvpCode,
                //     UnitName = familyUnitInfo?.UnitName,
                //     InvitationResponse = familyUnitInfo?.InvitationResponse ?? InvitationResponseEnum.Pending,
                //     MailingAddress = familyUnitInfo?.MailingAddress,
                //     InvitationResponseNotes = familyUnitInfo?.InvitationResponseNotes,
                //     HeadCount = familyUnitInfo?.PotentialHeadCount ?? 0,
                //     Guests = guestEntities.Select(guest => new GuestDto
                //     {
                //         GuestId = guest.GuestId,
                //         FirstName = guest.FirstName,
                //         LastName = guest.LastName,
                //         Roles = guest.Roles,
                //         Email = guest.Email,
                //         Phone = guest.Phone,
                //         AgeGroup = (AgeGroupEnum) guest.AgeGroup,
                //         RsvpNotes = guest.RsvpNotes,
                //         GuestLastLogin = guest.GuestLastLogin
                //     }).ToList()
                // };

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
