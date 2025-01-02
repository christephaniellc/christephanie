using System.Linq;
using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using AutoMapper;

namespace Wedding.Common.Helpers.AWS
{
    public class DynamoDBProvider : IDynamoDBProvider
    {
        private readonly ILogger<DynamoDBProvider> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;

        public DynamoDBProvider(ILogger<DynamoDBProvider> logger, IDynamoDBContext repository, IMapper mapper)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
        }
        public async Task<WeddingEntity?> LoadFamilyUnitOnlyAsync(string invitationCode, CancellationToken cancellationToken = default)
        {
            var familyInfoPartitionKey = DynamoKeys.GetPartitionKey(invitationCode.ToUpper());
            var familyInfoSortKey = DynamoKeys.GetFamilyInfoSortKey();

            return await _repository.LoadAsync<WeddingEntity>(
                familyInfoPartitionKey, familyInfoSortKey, cancellationToken);
        }

        public async Task<WeddingEntity?> LoadGuestByGuestIdAsync(string invitationCode, string guestId,
            CancellationToken cancellationToken = default)
        {
            var partitionKey = DynamoKeys.GetPartitionKey(invitationCode.ToUpper());
            var guestSortKey = DynamoKeys.GetGuestSortKey(guestId);

            return await _repository.LoadAsync<WeddingEntity>(
                partitionKey, guestSortKey, cancellationToken);
        }

        public async Task<FamilyUnitDto?> GetFamilyUnitAsync(string invitationCode,
            CancellationToken cancellationToken = default)
        {
            var partitionKey = DynamoKeys.GetPartitionKey(invitationCode.ToUpper());
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

            var results = await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery).GetRemainingAsync();

            var numFamilies = results.Where(f => f.SortKey == DynamoKeys.FamilyInfo).ToList();
            if (numFamilies.Count > 1)
            {
                _logger.LogError("Multiple family units with Invitation code '{query.InvitationCode}' found.");
                throw new ApplicationException($"Multiple family units with Invitation code '{invitationCode}' found.");
            }

            var familyUnit = _mapper.Map<FamilyUnitDto>(results.FirstOrDefault(x => x.SortKey == DynamoKeys.FamilyInfo));
            var guests = results.Where(x => x.SortKey.StartsWith(DynamoKeys.Guest))
                .Select(x => _mapper.Map<GuestDto>(x))
                .ToList();

            if (guests.Count == 0)
            {
                _logger.LogError($"No guests with invitation code '{invitationCode}' found.");
                throw new ApplicationException($"Invalid invitation code '{invitationCode}', no guests found.");
            }

            familyUnit.Guests = guests;
            familyUnit.Guests = familyUnit.OrderedGuests();

            return familyUnit;
        }

        public async Task SaveAsync(WeddingEntity entity, CancellationToken cancellationToken = default)
        {
            await _repository.SaveAsync(entity, cancellationToken);
        }
    }
}
