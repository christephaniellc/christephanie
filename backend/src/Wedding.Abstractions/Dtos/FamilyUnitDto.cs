using System;
using System.Collections.Generic;

namespace Wedding.Abstractions.Dtos
{
    public class FamilyUnitDto
    {
        public string RsvpCode { get; set; } = "";

        public string UnitName { get; set; } = "";

        public string Tier { get; set; } = "";

        public List<GuestDto>? Guests { get; set; }

        public string? MailingAddress { get; set; }

        public List<string>? AdditionalAddresses { get; set; }

        public string? InvitationResponseNotes { get; set; }

        public int PotentialHeadCount { get; set; }

        public DateTime? FamilyUnitLastLogin { get; set; }
    }
}
