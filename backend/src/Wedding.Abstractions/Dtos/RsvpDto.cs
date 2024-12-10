using System;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class RsvpDto
    {
        public string GuestId { get; set; } = "";

        public InvitationResponseEnum InvitationResponse { get; set; }

        public RsvpEnum? Wedding { get; set; }

        public SleepPreferenceEnum? SleepPreference { get; set; }

        public RsvpEnum? RehearsalDinner { get; set; }

        public RsvpEnum FourthOfJuly { get; set; }

        public RsvpEnum? BuildWeek { get; set; }

        public DateTime? ArrivalDate { get; set; }
        //public DateTime DepartureDate { get; set; }
    }
}
