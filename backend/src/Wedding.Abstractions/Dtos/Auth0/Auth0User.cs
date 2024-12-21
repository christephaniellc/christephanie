using System.Collections.Generic;

namespace Wedding.Abstractions.Dtos.Auth0
{
    public class Auth0User
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public Dictionary<string, object> AppMetadata { get; set; }
        public Dictionary<string, object> UserMetadata { get; set; }
    }
}
