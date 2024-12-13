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
using Wedding.Lambdas.FamilyUnit.Get.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Validation;

namespace Wedding.Lambdas.FamilyUnit.Get.Handlers
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

            var partitionKey = DynamoKeys.GetFamilyUnitPartitionKey(query.RsvpCode);

            try
            {
                var dynamoQuery = new QueryOperationConfig()
                {
                    KeyExpression = new Expression
                    {
                        ExpressionStatement = "PartitionKey = :pk",
                        ExpressionAttributeValues =
                        {
                            { ":pk", partitionKey },
                        }
                    }
                };

                //var result = await _repository.LoadAsync<WeddingEntity>(partitionKey, cancellationToken);
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
                familyUnit.Guests = familyUnit.OrderedGuests();

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
