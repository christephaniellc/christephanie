using System.Collections.Generic;
using System.Text.Json.Serialization;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos.Auth0
{
    public class Auth0User
    {
        [JsonPropertyName("sub")]
        public string UserId { get; set; }
        [JsonPropertyName("email")]
        public string Email { get; set; }
        [JsonPropertyName("email_verified")]
        public bool EmailVerified { get; set; }
        [JsonPropertyName("given_name")]
        public string GivenName { get; set; }
        [JsonPropertyName("family_name")]
        public string FamilyName { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("nickname")]
        public string Nickname { get; set; }
        [JsonPropertyName("picture")]
        public string Picture { get; set; }
        [JsonPropertyName("app_metadata")]
        public Dictionary<string, object> AppMetadata { get; set; }
        [JsonPropertyName("user_metadata")]
        public Dictionary<string, object> UserMetadata { get; set; }
        [JsonPropertyName("invitation_code")]
        public string InvitationCode { get; set; }
        [JsonPropertyName("roles")]
        public List<RoleEnum> Roles { get; set; }
    }
}
