using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class FamilyUnitDto
    {
        public string InvitationCode { get; set; } = "";

        public string UnitName { get; set; } = "";

        public string Tier { get; set; } = "";

        public List<GuestDto>? Guests { get; set; }

        public AddressDto? MailingAddress { get; set; }

        public List<AddressDto>? AdditionalAddresses { get; set; }

        public string? InvitationResponseNotes { get; set; }

        public int PotentialHeadCount { get; set; }

        public DateTime? FamilyUnitLastLogin { get; set; }

        public int CalculateHeadcount()
        {
            var headcount = 0;
            if (Guests != null)
                foreach (var guest in Guests)
                {
                    if (guest.Rsvp is null
                        || guest.Rsvp.InvitationResponse != InvitationResponseEnum.Declined)
                    {
                        headcount++;
                    }
                }

            return headcount;
        }

        public List<GuestDto>? OrderedGuests()
        {
            if (Guests == null)
            {
                return null;
            }

            return Guests.OrderBy(g => g.GuestNumber!).ToList();
        }
    }
}
