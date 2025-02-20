using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;

namespace Wedding.Lambdas.Guest.Patch.Requests
{
    public class PatchGuestRequest
    {
        public required string GuestId { get; set; }
        public string? Auth0Id { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public RsvpDto? Rsvp { get; set; }
        public PreferencesDto? Preferences { get; set; }
        public AgeGroupEnum? AgeGroup { get; set; }
    }
}
