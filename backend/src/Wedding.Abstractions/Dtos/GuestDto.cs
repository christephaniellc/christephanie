using System;
using System.Collections.Generic;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class GuestDto
    {
        public string InvitationCode { get; set; } = "";

        public string GuestId { get; set; } = "";

        public int? GuestNumber { get; set; }

        public string? Auth0Id { get; set; }
        
        public string FirstName { get; set; } = "";

        public List<string>? AdditionalFirstNames { get; set; }

        public string LastName { get; set; } = "";

        public required List<RoleEnum> Roles { get; set; }

        public VerifiedDto? Email { get; set; }

        public VerifiedDto? Phone { get; set; }

        public RsvpDto? Rsvp { get; set; }

        public PreferencesDto? Preferences { get; set; }

        /// <summary>
        /// If child
        /// </summary>
        public AgeGroupEnum AgeGroup { get; set; }
        //public bool BabySittingRequest { get; set; } = false;

        /// <summary>
        /// Guest last login as first element
        /// </summary>
        public DateTime? LastActivity { get; set; }

        public bool IsAdmin()
        {
            return Roles.Contains(RoleEnum.Admin);
        }
    }
}
