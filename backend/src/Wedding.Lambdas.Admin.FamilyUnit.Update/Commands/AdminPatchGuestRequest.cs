using Wedding.Abstractions.Enums;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Commands
{
    public class AdminPatchGuestRequest
    {
        public required string InvitationCode { get; set; }
        public required string GuestId { get; set; }
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
    }
}
