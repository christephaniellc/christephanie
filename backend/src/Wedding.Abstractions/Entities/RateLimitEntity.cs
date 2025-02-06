using Amazon.DynamoDBv2.DataModel;
using System;

namespace Wedding.Abstractions.Entities
{
    public class RateLimitEntity
    {
        [DynamoDBHashKey]
        public string Route { get; set; }

        [DynamoDBRangeKey]
        public string IpAddress { get; set; }

        [DynamoDBProperty]
        public int RequestCount { get; set; }

        [DynamoDBProperty]
        public DateTime LastRequestTime { get; set; }

        [DynamoDBProperty]
        public long ExpirationTime { get; set; }
    }
}
