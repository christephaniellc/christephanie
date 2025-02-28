namespace Wedding.Common.ThirdParty
{
    public class UspsTokenRequest
    {
        public required string client_id { get; set; }
        public required string client_secret { get; set; }
        public required string grant_type { get; set; }
    }
}
