namespace Wedding.Abstractions.Dtos
{
    public class ConfigurationDesignDto
    {
        public required string GuestId { get; set; } = "";

        public string? DesignId { get; set; } = "";

        public string? Name { get; set; }

        public LastUpdateAuditDto? DateCreated { get; set; }

        public LastUpdateAuditDto? DateUpdated { get; set; }
    }
}
