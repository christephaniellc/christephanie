namespace Wedding.Common.Configuration
{
    public class StripeConfiguration
    {
        public required string PublicKey { get; set; }
        public required string SecretKey { get; set; }
        public required string WebhookSecret { get; set; }
    }
}
