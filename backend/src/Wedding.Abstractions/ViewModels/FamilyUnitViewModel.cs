using System.Collections.Generic;
using System;

namespace Wedding.Abstractions.ViewModels
{
    public class FamilyUnitViewModel
    {

        public string InvitationCode { get; set; } = "";

        public string UnitName { get; set; } = "";

        public List<GuestViewModel>? Guests { get; set; }

        public string? MailingAddress { get; set; }

        public string? InvitationResponseNotes { get; set; }

        public DateTime? FamilyUnitLastLogin { get; set; }
    }
}
