using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class RsvpDto
    {
        #region Save the date response
        public InvitationResponseEnum InvitationResponse { get; set; }

        public LastUpdateAuditDto? InvitationResponseAudit { get; set; }
        #endregion

        public RsvpEnum? RehearsalDinner { get; set; }

        /// <summary>
        /// Only available if camping sleep preference is set to camping
        /// </summary>
        public RsvpEnum? FourthOfJuly { get; set; }

        public RsvpEnum? Wedding { get; set; }

        public LastUpdateAuditDto? RsvpAudit { get; set; }

        /// <summary>
        /// If declining, also other notes from guest
        /// </summary>
        public string? RsvpNotes { get; set; }
    }
}
