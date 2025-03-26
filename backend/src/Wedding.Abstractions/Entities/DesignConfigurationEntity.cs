using Amazon.DynamoDBv2.DataModel;

namespace Wedding.Abstractions.Entities
{
    public class DesignConfigurationEntity
    {
        [DynamoDBHashKey]
        public required string PartitionKey { get; set; } // e.g., GUEST#123-456

        [DynamoDBRangeKey]
        public required string SortKey { get; set; } = ""; // e.g., "CONFIG#INVITATION#design-id-in-guid"

        [DynamoDBProperty]
        public required string GuestId { get; set; } = "";

        public required string DesignId { get; set; } = "";

        [DynamoDBProperty]
        public string? Name { get; set; }

        [DynamoDBProperty]
        public required string ConfigurationData { get; set; }

        [DynamoDBProperty]
        public string? DateCreated { get; set; }

        [DynamoDBProperty]
        public string? DateUpdated { get; set; }
    }
}
