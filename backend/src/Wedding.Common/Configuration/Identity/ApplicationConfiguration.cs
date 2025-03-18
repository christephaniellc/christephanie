namespace Wedding.Common.Configuration.Identity
{
    public sealed class ApplicationConfiguration
    {
        public string? ApplicationName { get; set; }
        public string? MailFromAddress { get; set; }
        public string? DomainName { get; set; }
        public string? EncryptionKey { get; set; }
    }
}
