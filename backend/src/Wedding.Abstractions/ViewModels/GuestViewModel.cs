using System.Collections.Generic;
using System;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Dtos.ClientInfo;

namespace Wedding.Abstractions.ViewModels
{
    public class GuestViewModel
    {
        public string InvitationCode { get; set; } = "";

        public string GuestId { get; set; } = "";

        public int? GuestNumber { get; set; }

        public string? Auth0Id { get; set; }

        public string FirstName { get; set; } = "";

        public List<string>? AdditionalFirstNames { get; set; }

        public string LastName { get; set; } = "";

        public required List<RoleEnum> Roles { get; set; }

        public bool? AllowBetaScreenRecordings { get; set; }

        public MaskedVerifiedModel? Email { get; set; }

        public MaskedVerifiedModel? Phone { get; set; }

        public RsvpDto? Rsvp { get; set; }

        public PreferencesDto? Preferences { get; set; }

        public List<ClientInfoDto>? ClientInfos { get; set; }

        /// <summary>
        /// If child
        /// </summary>
        public AgeGroupEnum AgeGroup { get; set; }

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
