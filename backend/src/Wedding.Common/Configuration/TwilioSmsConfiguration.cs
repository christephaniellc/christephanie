namespace Wedding.Common.Configuration
{
    public class TwilioSmsConfiguration
    {
        public required string ApiSid { get; set; }
        public required string ApiSecret { get; set; }
        public required string TwilioFromPhone { get; set; }
        public required string VerifyServiceSid { get; set; }
        public required string MessagingServiceSid { get; set; }
    }
}
