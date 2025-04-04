using Amazon.DynamoDBv2.DataModel;

namespace Wedding.Abstractions.Entities
{
    public class PaymentIntentEntity
    {
        [DynamoDBHashKey]
        public string? PartitionKey { get; set; } // e.g., "PAYMENT#pi_123"

        [DynamoDBRangeKey]
        public string? SortKey { get; set; } = ""; // e.g., "METADATA#2025-04-03T12:00:00Z"

        [DynamoDBProperty]
        public required string PaymentIntentId { get; set; } = "";

        [DynamoDBProperty]
        public required string GuestId { get; set; } = "";

        [DynamoDBProperty]
        public required long Amount { get; set; } // Stripe uses long

        [DynamoDBProperty]
        public required string Currency { get; set; }

        [DynamoDBProperty]
        public required string GiftCategory { get; set; }

        [DynamoDBProperty]
        public required string GiftNotes { get; set; }

        [DynamoDBProperty]
        public required string GuestName { get; set; }

        [DynamoDBProperty]
        public required bool IsAnonymous { get; set; }

        [DynamoDBProperty]
        public required string Timestamp { get; set; } // ISO8601

        [DynamoDBGlobalSecondaryIndexHashKey("GSI1")]
        public string? GuestIdGSI { get; set; } // "GUEST#<GuestId>"

        [DynamoDBGlobalSecondaryIndexRangeKey("GSI1")]
        public string? GuestSortKey { get; set; } // ISO8601 Timestamp

        [DynamoDBGlobalSecondaryIndexHashKey("GSI2")]
        public string? GiftCategoryGSI { get; set; } // "CATEGORY#<GiftCategory>"

        [DynamoDBGlobalSecondaryIndexRangeKey("GSI2")]
        public string? CategorySortKey { get; set; } // ISO8601 Timestamp
    }
}
