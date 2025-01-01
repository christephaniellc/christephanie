using System.Text.Json.Serialization;

namespace Wedding.Abstractions.Dtos.Auth
{
    public class AuthContext
    {
        [JsonPropertyName("guestId")]
        public string GuestId { get; set; }

        [JsonPropertyName("invitationCode")]
        public string InvitationCode { get; set; }

        [JsonPropertyName("roles")]
        public string Roles { get; set; }

        [JsonPropertyName("token")]
        public string Token { get; set; }
    }
}
