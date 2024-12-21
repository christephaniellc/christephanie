namespace Wedding.Common.Configuration.Identity
{
    public sealed class Auth0Configuration
    {
        public string? Authority { get; set; }
        public string? Audience { get; set; }
        public string? ClientId { get; set; }
        public string? ClientSecret { get; set; }
        public string? DynamoUserTableName { get; set; }
        public string? DynamoIdentityCol { get; set; }
        public string? DynamoIdentityIndex { get; set; }
    }
}
