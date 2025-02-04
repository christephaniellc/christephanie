using System.Collections.Generic;
using System;
using Wedding.Abstractions.Dtos;

namespace Wedding.Abstractions.ViewModels
{
    public class FamilyUnitViewModel
    {

        public string InvitationCode { get; set; } = "";

        public string UnitName { get; set; } = "";

        public List<GuestDto>? Guests { get; set; }

        public AddressDto? MailingAddress { get; set; }

        public List<AddressDto>? AdditionalAddresses { get; set; }

        public string? InvitationResponseNotes { get; set; }

        public DateTime? FamilyUnitLastLogin { get; set; }
    }
}
