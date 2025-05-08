using System.Collections.Generic;
using Amazon.DynamoDBv2.DataModel;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;

namespace Wedding.Abstractions.Entities
{
    public class NotificationDataEntity
    {
        [DynamoDBHashKey]
        public string? PartitionKey { get; set; } // e.g., "EMAIL#<GuestId>"

        [DynamoDBRangeKey]
        public string? SortKey { get; set; } = ""; // e.g., "2025-04-03T12:00:00Z#<CampaignType>"

        [DynamoDBProperty]
        public required string GuestEmailLogId { get; set; } = "";

        [DynamoDBProperty]
        public string GuestId { get; set; } = "";

        [DynamoDBProperty(typeof(EnumToStringConverter<CampaignTypeEnum>))]
        public CampaignTypeEnum? EmailType { get; set; }

        [DynamoDBProperty]
        public string? CampaignId { get; set; }

        [DynamoDBProperty]
        public required string Timestamp { get; set; } // ISO8601

        [DynamoDBProperty]
        public string DeliveryStatus { get; set; } = "PENDING";

        [DynamoDBProperty]
        public string EmailAddress { get; set; } = "";

        [DynamoDBProperty]
        public bool Verified { get; set; }

        [DynamoDBProperty]
        public Dictionary<string, string>? Metadata { get; set; }

        [DynamoDBGlobalSecondaryIndexHashKey("CampaignTypeIndex")]
        public string? CampaignTypeIndexPartitionKey { get; set; } // e.g., "RSVP_NOTIFY"

        [DynamoDBGlobalSecondaryIndexRangeKey("CampaignTypeIndex")]
        public string? CampaignTypeIndexSortKey { get; set; } // e.g., "GUEST#<GuestId>"
    }
}
