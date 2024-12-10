using System;
using System.Collections.Generic;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class GuestDto
    {
        public string GuestId { get; set; } = "";

        public string? Auth0Id { get; set; }

        public string FirstName { get; set; } = "";

        public string LastName { get; set; } = "";

        public List<RoleEnum> Roles { get; set; }

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public RsvpDto? Rsvp { get; set; }

        public PreferencesDto? Preferences { get; set; }

        /// <summary>
        /// If child
        /// </summary>
        public AgeGroupEnum AgeGroup { get; set; }
        //public bool BabySittingRequest { get; set; } = false;

        /// <summary>
        /// If declining, also other notes from guest
        /// </summary>
        public string? RsvpNotes { get; set; }

        /// <summary>
        /// Guest last login (using Auth0)
        /// </summary>
        public DateTime? GuestLastLogin { get; set; }
    }
}
