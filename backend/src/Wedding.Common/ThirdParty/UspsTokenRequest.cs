namespace Wedding.Common.ThirdParty
{
    public class UspsTokenRequest
    {
        public string client_id { get; set; }
        public string client_secret { get; set; }
        public string grant_type { get; set; }
    }
}
