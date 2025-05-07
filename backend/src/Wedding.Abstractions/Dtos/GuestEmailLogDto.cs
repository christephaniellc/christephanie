using System.Collections.Generic;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class GuestEmailLogDto
    {
        public string GuestEmailLogId { get; set; }
        public string GuestId { get; set; } = "";
        public EmailTypeEnum EmailType { get; set; }
        public string? CampaignId { get; set; }
        public string Timestamp { get; set; }
        public string DeliveryStatus { get; set; } = "PENDING";
        public string EmailAddress { get; set; } = "";
        public bool Verified { get; set; }
        public Dictionary<string, string>? Metadata { get; set; }
    }
}
