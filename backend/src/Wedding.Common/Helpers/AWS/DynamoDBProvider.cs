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
using Wedding.Abstractions.Enums;
using Wedding.Common.Multitenancy;
using System.Globalization;
using static Wedding.Abstractions.Keys.DynamoKeys;
using System.Reflection.Emit;

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

        public DynamoDBOperationConfig GetTableConfig(string audience, DatabaseTableEnum table = DatabaseTableEnum.GuestData)
        {
            return new DynamoDBOperationConfig
            {
                OverrideTableName = _multitenancySettingsProvider.GetMappedTableName(audience, table)
            };
        }

        /// <summary> 
        /// Checks if an IP has exceeded the rate limit for a given route.
        /// </summary>
        /// <param name="audience"></param>
        /// <param name="ipAddress"></param>
        /// <param name="route"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public async Task<bool> CheckRateLimitAsync(string audience, string ipAddress, string route, 
            int rateLimit = 3, double rateLimitPerSeconds = 1.0, CancellationToken cancellationToken = default)
        {
            var config = GetTableConfig(audience, DatabaseTableEnum.RateLimiting);
            var now = DateTime.UtcNow;

            // Retrieve existing rate limit record
            var entity = await _repository.LoadAsync<RateLimitEntity>(route, ipAddress, config, cancellationToken);
            if (entity != null)
            {
                var requestCount = entity.RequestCount; var lastRequestTime = entity.LastRequestTime;
                if (lastRequestTime.Kind == DateTimeKind.Unspecified)
                {
                    lastRequestTime = DateTime.SpecifyKind(lastRequestTime, DateTimeKind.Utc);
                }
                else if (lastRequestTime.Kind == DateTimeKind.Local)
                {
                    lastRequestTime = lastRequestTime.ToUniversalTime();
                }

                Console.WriteLine($"Request count: {requestCount} / Rate limit: {rateLimit} / Rate limit per seconds: {rateLimitPerSeconds}");
                Console.WriteLine($"NOW: {now} - LRT: {lastRequestTime} {now.Subtract(lastRequestTime).TotalSeconds
                }.  Test: {now.Subtract(lastRequestTime).TotalSeconds >= rateLimitPerSeconds}");

                var difference = now.Subtract(lastRequestTime);
                if (difference.TotalSeconds >= rateLimitPerSeconds)
                {
                    Console.WriteLine("Resetting request count.");
                    entity.RequestCount = 1; // Reset count after rate limit window expires
                    entity.LastRequestTime = now;
                    entity.ExpirationTime = DateTimeOffset.UtcNow.AddMinutes(10).ToUnixTimeSeconds();
                }
                else if (requestCount >= rateLimit)
                {
                    Console.WriteLine($"Rate-limiting triggered: RequestCount={entity.RequestCount}, TimeDiff={now.Subtract(entity.LastRequestTime).TotalSeconds}");
                    return true; // Rate limited
                }
                else
                {
                    entity.RequestCount = requestCount + 1;
                    entity.LastRequestTime = now;
                }

                // Allow 3 requests per second
                // if (requestCount >= RATE_LIMIT &&
                //     (now - lastRequestTime).TotalSeconds < RATE_LIMIT_PER_SECONDS)
                // {
                //     return true; // Rate limited
                // }

                // entity.RequestCount = requestCount + 1;
                // entity.LastRequestTime = now;

                await _repository.SaveAsync(entity, config, cancellationToken);
            }
            else
            {
                var newRecord = new RateLimitEntity
                {
                    Route = route,
                    IpAddress = ipAddress,
                    RequestCount = 1,
                    LastRequestTime = now,
                    ExpirationTime = DateTimeOffset.UtcNow.AddMinutes(10).ToUnixTimeSeconds() // Auto-clean (table has TTL)
                };

                await _repository.SaveAsync(newRecord, config, cancellationToken);
            }

            return false; // Not rate limited
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
                _logger.LogError($"Multiple family units with Invitation code '{invitationCode}' found.");
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

            // Group by InvitationCode
            var groupedResults = results
                .Where(x => x.SortKey == DynamoKeys.FamilyInfo)
                .GroupBy(x => x.InvitationCode);

            foreach (var group in groupedResults)
            {
                var invitationCode = group.Key;
                var familyInfoEntity = group.FirstOrDefault();
                
                if (familyInfoEntity == null) continue;

                var familyUnit = _mapper.Map<FamilyUnitDto>(familyInfoEntity);
                
                // Find all guests for this family unit
                var guests = results
                    .Where(x => x.SortKey.StartsWith(DynamoKeys.Guest) && x.InvitationCode.Equals(invitationCode))
                    .Select(x => _mapper.Map<GuestDto>(x))
                    .ToList();

                if (guests.Count == 0)
                {
                    _logger.LogError($"No guests with invitation code '{invitationCode}' found.");
                    // Not throwing exception, just logging the error
                }

                familyUnit.Guests = guests;
                familyUnit.Guests = familyUnit.OrderedGuests();

                familyUnits.Add(familyUnit);
            }

            return familyUnits;
        }
        
        public async Task<DesignConfigurationEntity?> GetPhotoConfigurationAsync(string audience, string guestId, string configurationId, CancellationToken cancellationToken = default)
        {
            // const result = await docClient.query({
            //     TableName: 'WeddingConfigurations',
            //     IndexName: 'AllConfigsIndex',
            //     KeyConditionExpression: 'ConfigPK = :template',
            //     ExpressionAttributeValues:
            //     {
            //         ':template': 'CONFIG#invitation#modern' // Modern = designId
            //     }
            // });

            var partitionKey = DynamoKeys.GetConfigurationPartitionKey(guestId);
            var configSortKey = DynamoKeys.GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum.Invitation, configurationId);

            //
            // var dynamoQuery = new QueryOperationConfig()
            // {
            //     KeyExpression = new Expression
            //     {
            //         ExpressionStatement = "PartitionKey = :pk",
            //         ExpressionAttributeValues =
            //         {
            //             { ":pk", partitionKey },
            //         }
            //     }
            // };

            // return await _repository.FromQueryAsync<InvitationDesignEntity>(dynamoQuery, GetTableConfig(audience, DatabaseTableEnum.InvitationDesign)).GetRemainingAsync();

            return await _repository.LoadAsync<DesignConfigurationEntity>(
                partitionKey, configSortKey, GetTableConfig(audience, DatabaseTableEnum.InvitationDesign), cancellationToken);
        }

        public async Task<List<DesignConfigurationEntity>?> GetPhotoConfigurationsAsync(string audience, CancellationToken cancellationToken = default)
        {
            // const result = await docClient.query({
            //     TableName: 'WeddingConfigurations',
            //     IndexName: 'AllConfigsIndex',
            //     KeyConditionExpression: 'ConfigPK = :template',
            //     ExpressionAttributeValues:
            //     {
            //         ':template': 'CONFIG#invitation#modern' // Modern = designId
            //     }
            // });
            var queryConfig = GetTableConfig(audience, DatabaseTableEnum.InvitationDesign);
            queryConfig.IndexName = DynamoKeys.AllConfigsIndex;

            //var partitionKey = DynamoKeys.GetConfigurationPartitionKey(guestId);
            var configSortKey = DynamoKeys.GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum.Invitation);


            var dynamoQuery = new QueryOperationConfig()
            {
                KeyExpression = new Expression
                {
                    ExpressionStatement = "PartitionKey = :template",
                    ExpressionAttributeValues =
                    {
                        { ":template", configSortKey },
                    }
                }
            };

            return await _repository.FromQueryAsync<DesignConfigurationEntity>(dynamoQuery, queryConfig).GetRemainingAsync(cancellationToken);

            // return await _repository.LoadAsync<InvitationDesignEntity>(
            //     partitionKey, configSortKey, GetTableConfig(audience, DatabaseTableEnum.InvitationDesign), cancellationToken);
        }

        #region Payments
        public async Task<List<PaymentIntentEntity>> GetAllPaymentsSortedByTimestampAsync(string audience, CancellationToken cancellationToken = default)
        {
            var scanConfig = new ScanOperationConfig
            {
                // Optional: limit properties scanned
            };

            var results = await _repository
                .FromScanAsync<PaymentIntentEntity>(scanConfig, GetTableConfig(audience, DatabaseTableEnum.PaymentData))
                .GetRemainingAsync(cancellationToken);

            return results.OrderByDescending(p => p.Timestamp).ToList();
        }

        public async Task<PaymentIntentEntity?> GetPaymentByIdAsync(string audience, string paymentIntentId, CancellationToken cancellationToken = default)
        {
            var partitionKey = PaymentKeys.GetPartitionKey(paymentIntentId); // "PAYMENT#pi_..."
            var dyanmoDBOperationConfig = GetTableConfig(audience, DatabaseTableEnum.PaymentData);

            var results = await _repository.QueryAsync<PaymentIntentEntity>(
                partitionKey,
                dyanmoDBOperationConfig).GetRemainingAsync(cancellationToken);

            return results
                .Where(e => e.SortKey.StartsWith("METADATA#"))
                .OrderByDescending(e => e.SortKey) // Newest first (ISO8601 sortable)
                .FirstOrDefault();
        }

        public async Task<List<PaymentIntentEntity>> GetPaymentsByGuestIdAsync(string audience, string guestId, CancellationToken cancellationToken = default)
        {
            var queryConfig = GetTableConfig(audience, DatabaseTableEnum.PaymentData);
            queryConfig.IndexName = "AllByGuestIndex";

            var gsiPartitionKey = PaymentKeys.GetGuestIdGSI(guestId);

            return await _repository.QueryAsync<PaymentIntentEntity>(gsiPartitionKey, queryConfig).GetRemainingAsync(cancellationToken);
        }

        public async Task<List<PaymentIntentEntity>> GetPaymentsByCategoryAsync(string audience, string giftCategory, CancellationToken cancellationToken = default)
        {
            var queryConfig = GetTableConfig(audience, DatabaseTableEnum.PaymentData);
            queryConfig.IndexName = "AllByCategoryIndex";

            var gsiPartitionKey = PaymentKeys.GetGiftCategoryGSI(giftCategory);

            return await _repository.QueryAsync<PaymentIntentEntity>(gsiPartitionKey, queryConfig).GetRemainingAsync(cancellationToken);
        }
        #endregion

        #region Notifications
        public async Task<List<GuestEmailLogDto>> GetAllEmailLogsAsync(string audience, CancellationToken cancellationToken = default)
        {
            var partitionKey = NotificationKeys.GetPartitionKey(guestId);
            var config = GetTableConfig(audience, DatabaseTableEnum.NotificationTracking);

            var results = await _repository.QueryAsync<NotificationDataEntity>(partitionKey, config)
                .GetRemainingAsync(cancellationToken);

            return results.Select(e => _mapper.Map<GuestEmailLogDto>(e)).ToList();
        }
        public async Task<List<GuestEmailLogDto>> GetEmailLogsByGuestIdAsync(string audience, string guestId, CancellationToken cancellationToken = default)
        {
            var partitionKey = NotificationKeys.GetPartitionKey(guestId);
            var config = GetTableConfig(audience, DatabaseTableEnum.NotificationTracking);

            var results = await _repository.QueryAsync<NotificationDataEntity>(partitionKey, config)
                .GetRemainingAsync(cancellationToken);

            return results.Select(e => _mapper.Map<GuestEmailLogDto>(e)).ToList();
        }

        public async Task<List<GuestEmailLogDto>> GetEmailLogsByCampaignTypeAsync(
            string audience,
            CampaignTypeEnum campaignType,
            CancellationToken cancellationToken = default)
        {
            // Get the string value from the [EnumMember] attribute or fallback to ToString()
            var campaignTypeValue = campaignType.ToString(); // assumes you store EnumMember string via converter

            var config = GetTableConfig(audience, DatabaseTableEnum.NotificationTracking);
            config.IndexName = "CampaignTypeIndex";

            var results = await _repository
                .QueryAsync<NotificationDataEntity>(campaignTypeValue, config)
                .GetRemainingAsync(cancellationToken);

            return results
                .Select(e => _mapper.Map<GuestEmailLogDto>(e))
                .ToList();
        }

        public async Task<GuestEmailLogDto?> GetEmailLogByGuestAndTimestampAsync(string audience, string guestId, string timestamp, CampaignTypeEnum campaignType, CancellationToken cancellationToken = default)
        {
            var partitionKey = NotificationKeys.GetPartitionKey(guestId);
            var sortKey = NotificationKeys.GetSortKey(timestamp, campaignType);
            var config = GetTableConfig(audience, DatabaseTableEnum.NotificationTracking);

            var entity = await _repository.LoadAsync<NotificationDataEntity>(partitionKey, sortKey, config, cancellationToken);
            return entity != null ? _mapper.Map<GuestEmailLogDto>(entity) : null;
        }
        #endregion

        public async Task SaveAsync(string audience, WeddingEntity entity, CancellationToken cancellationToken = default)
        {
            await _repository.SaveAsync(entity, GetTableConfig(audience, DatabaseTableEnum.GuestData), cancellationToken);
        }

        public async Task DeleteAsync(string audience, string invitationCode, string sortKey, CancellationToken cancellationToken = default)
        {
            var partitionKey = DynamoKeys.GetPartitionKey(invitationCode);
            await _repository.DeleteAsync<WeddingEntity>(partitionKey, sortKey, GetTableConfig(audience, DatabaseTableEnum.GuestData), cancellationToken);
        }

        public async Task SaveDesignAsync(string audience, DesignConfigurationEntity entity, CancellationToken cancellationToken = default)
        {
            await _repository.SaveAsync(entity, GetTableConfig(audience, DatabaseTableEnum.InvitationDesign), cancellationToken);
        }

        public async Task DeleteDesignAsync(string audience, string guestId, string configurationId, CancellationToken cancellationToken = default)
        {
            var partitionKey = DynamoKeys.GetConfigurationPartitionKey(guestId);
            var configSortKey = DynamoKeys.GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum.Invitation, configurationId);
            await _repository.DeleteAsync<DesignConfigurationEntity>(partitionKey, configSortKey, 
                GetTableConfig(audience, DatabaseTableEnum.InvitationDesign), cancellationToken);
        }

        public async Task SavePaymentAsync(string audience, PaymentIntentEntity entity, CancellationToken cancellationToken = default)
        {
            entity.PartitionKey = DynamoKeys.PaymentKeys.GetPartitionKey(entity.PaymentIntentId);
            entity.SortKey = DynamoKeys.PaymentKeys.GetSortKey(entity.Timestamp);
            entity.GuestIdGSI = DynamoKeys.PaymentKeys.GetGuestIdGSI(entity.GuestId);
            entity.GuestSortKey = entity.Timestamp;
            entity.GiftCategoryGSI = DynamoKeys.PaymentKeys.GetGiftCategoryGSI(entity.GiftCategory);
            entity.CategorySortKey = entity.Timestamp;

            await _repository.SaveAsync(entity, GetTableConfig(audience, DatabaseTableEnum.PaymentData), cancellationToken);
        }

        public async Task UpdatePaymentStatusAsync(string audience, PaymentIntentEntity entity, string status, CancellationToken cancellationToken = default)
        {
            entity.Status = status;

            await _repository.SaveAsync(entity, GetTableConfig(audience, DatabaseTableEnum.PaymentData), cancellationToken);
        }

        public async Task DeletePaymentAsync(string audience, string paymentId, CancellationToken cancellationToken = default)
        {
            var partitionKey = DynamoKeys.GetPartitionKey(paymentId);
            await _repository.DeleteAsync<WeddingEntity>(partitionKey, GetTableConfig(audience, DatabaseTableEnum.PaymentData), cancellationToken);
        }


        public async Task SaveNotificationAsync(string audience, NotificationDataEntity entity, CancellationToken cancellationToken = default)
        {
            entity.PartitionKey = DynamoKeys.NotificationKeys.GetPartitionKey(entity.GuestId);
            entity.SortKey = DynamoKeys.NotificationKeys.GetSortKey(entity.Timestamp, entity.EmailType.Value);
            entity.CampaignTypeIndexPartitionKey = DynamoKeys.NotificationKeys.GetCampaignIdGSI(entity.CampaignId);
            entity.CampaignTypeIndexSortKey = DynamoKeys.GetGuestSortKey(entity.GuestId);

            await _repository.SaveAsync(entity, GetTableConfig(audience, DatabaseTableEnum.NotificationTracking), cancellationToken);
        }

        // public async Task UpdateNotificationAsync(string audience, NotificationDataEntity entity, string status, CancellationToken cancellationToken = default)
        // {
        //     entity.Status = status;
        //
        //     await _repository.SaveAsync(entity, GetTableConfig(audience, DatabaseTableEnum.NotificationTracking), cancellationToken);
        // }

        // public async Task DeleteNotificationAsync(string audience, string guestId, CampaignTypeEnum campaignType, CancellationToken cancellationToken = default)
        // {
        //     var partitionKey = DynamoKeys.NotificationKeys.GetPartitionKey(guestId);
        //     var sortKey = DynamoKeys.NotificationKeys.GetSortKey(entity.Timestamp, entity.CampaignType.Value);
        //     await _repository.DeleteAsync<WeddingEntity>(partitionKey, GetTableConfig(audience, DatabaseTableEnum.NotificationTracking), cancellationToken);
        // }
    }
}
