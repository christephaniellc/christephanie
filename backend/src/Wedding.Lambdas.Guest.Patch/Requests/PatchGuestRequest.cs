using System.Collections.Generic;
using Wedding.Abstractions.Enums;

namespace Wedding.Lambdas.Guest.Patch.Requests
{
    public class PatchGuestRequest
    {
        public required string GuestId { get; set; }
        public AgeGroupEnum? AgeGroup { get; set; }
        public string? Auth0Id { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }

        /// <summary>
        /// RSVP
        /// </summary>
        public InvitationResponseEnum? InvitationResponse { get; set; }
        public RsvpEnum? RehearsalDinner { get; set; }
        public RsvpEnum? FourthOfJuly { get; set; }
        public RsvpEnum? Wedding { get; set; }
        public string? RsvpNotes { get; set; }

        /// <summary>
        /// Preferences
        /// </summary>
        public List<NotificationPreferenceEnum>? NotificationPreference { get; set; }
        public SleepPreferenceEnum? SleepPreference { get; set; }
        public FoodPreferenceEnum? FoodPreference { get; set; }
        public List<string>? FoodAllergies { get; set; }
        public bool? AllowBetaScreenRecordings { get; set; }
    }
}
