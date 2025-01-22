using System.Linq;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using AutoMapper;
using Wedding.Common.Multitenancy;

namespace Wedding.Common.Helpers.AWS
{
    public class DynamoDBProvider : IDynamoDBProvider
    {
        private readonly ILogger<DynamoDBProvider> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;
        private readonly IMultitenancySettingsProvider _multitenancySettingsProvider;

        public DynamoDBProvider(ILogger<DynamoDBProvider> logger, 
            IDynamoDBContext repository, 
            IMapper mapper, 
            IMultitenancySettingsProvider multitenancySettingsProvider)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
            _multitenancySettingsProvider = multitenancySettingsProvider;
        }

        public DynamoDBOperationConfig GetTableConfig(string audience)
        {
            return new DynamoDBOperationConfig
            {
                OverrideTableName = _multitenancySettingsProvider.GetMappedTableName(audience)
            };
        }

        public async Task<WeddingEntity?> LoadFamilyUnitOnlyAsync(string audience, string invitationCode, CancellationToken cancellationToken = default)
        {
            var familyInfoPartitionKey = DynamoKeys.GetPartitionKey(invitationCode);
            var familyInfoSortKey = DynamoKeys.GetFamilyInfoSortKey();

            return await _repository.LoadAsync<WeddingEntity>(
                familyInfoPartitionKey, familyInfoSortKey, GetTableConfig(audience), cancellationToken);
        }

        /// <summary>
        /// TODO Is this necessary with query by guest ID?
        /// </summary>
        /// <param name="invitationCode"></param>
        /// <param name="guestId"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public async Task<WeddingEntity?> LoadGuestByGuestIdAsync(string audience, string invitationCode, string guestId,
            CancellationToken cancellationToken = default)
        {
            var partitionKey = DynamoKeys.GetPartitionKey(invitationCode);
            var guestSortKey = DynamoKeys.GetGuestSortKey(guestId);
        
            return await _repository.LoadAsync<WeddingEntity>(
                partitionKey, guestSortKey, GetTableConfig(audience), cancellationToken);
        }

        public async Task<List<WeddingEntity>?> QueryAsync(string audience, string invitationCode, CancellationToken cancellationToken = default)
        {
            return await FromQueryAsync(audience, invitationCode, cancellationToken);
        }

        public async Task<List<WeddingEntity>?> QueryByGuestIdIndex(string audience, string guestId, CancellationToken cancellationToken = default)
        {
            var queryConfig = GetTableConfig(audience);
            queryConfig.IndexName = DynamoKeys.GuestIdIndex;
            return await _repository.QueryAsync<WeddingEntity>(guestId, queryConfig).GetRemainingAsync();
        }

        /// <summary>
        /// Returns a family unit
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="invitationCode"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public async Task<List<WeddingEntity>?> FromQueryAsync(string audience, string invitationCode, CancellationToken cancellationToken = default)
        {
            var partitionKey = DynamoKeys.GetPartitionKey(invitationCode);
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

            return await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery, GetTableConfig(audience)).GetRemainingAsync();
        }

        public async Task<FamilyUnitDto?> GetFamilyUnitAsync(string audience, string invitationCode,
            CancellationToken cancellationToken = default)
        {
            var partitionKey = DynamoKeys.GetPartitionKey(invitationCode);
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

            var results = await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery, GetTableConfig(audience)).GetRemainingAsync();

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

        public async Task<List<FamilyUnitDto>?> GetFamilyUnitsAsync(string audience, CancellationToken cancellationToken = default)
        {
            var familyUnits = new List<FamilyUnitDto>();
            var scanConfig = new ScanOperationConfig
            {
                // Add any optional filters here, if needed
            }; 

            var results = await _repository.FromScanAsync<WeddingEntity>(scanConfig, GetTableConfig(audience)).GetRemainingAsync();

            //var numFamilies = results.Where(f => f.SortKey == DynamoKeys.FamilyInfo).ToList();

            var familyUnitEntities = _mapper.Map<List<FamilyUnitDto>>(results.FirstOrDefault(x => x.SortKey == DynamoKeys.FamilyInfo));

            foreach (var familyUnit in familyUnitEntities)
            {
                var guests = results.Where(x => 
                        x.SortKey.StartsWith(DynamoKeys.Guest) && x.InvitationCode.Equals(familyUnit.InvitationCode))
                    .Select(x => _mapper.Map<GuestDto>(x))
                    .ToList();

                if (guests.Count == 0)
                {
                    _logger.LogError($"No guests with invitation code '{familyUnit.InvitationCode}' found.");
                    //throw new ApplicationException($"Invalid invitation code '{familyUnit.InvitationCode}', no guests found.");
                }

                familyUnit.Guests = guests;
                familyUnit.Guests = familyUnit.OrderedGuests();

                familyUnits.Add(familyUnit);
            }

            return familyUnits;
        }

        public async Task SaveAsync(string audience, WeddingEntity entity, CancellationToken cancellationToken = default)
        {
            await _repository.SaveAsync(entity, GetTableConfig(audience), cancellationToken);
        }

        public async Task DeleteAsync(string audience, string invitationCode, string sortKey, CancellationToken cancellationToken = default)
        {
            var partitionKey = DynamoKeys.GetPartitionKey(invitationCode);
            await _repository.DeleteAsync<WeddingEntity>(partitionKey, sortKey, GetTableConfig(audience), cancellationToken);
        }
    }
}
