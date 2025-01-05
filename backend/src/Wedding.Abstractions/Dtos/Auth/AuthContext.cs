using System.Collections.Generic;
using System;
using System.Linq;
using System.Text.Json.Serialization;
using Wedding.Abstractions.Enums;

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
        
        public List<RoleEnum> ParseRoles()
        {
            if (string.IsNullOrWhiteSpace(Roles))
            {
                return new List<RoleEnum>();
            }

            var roles = Roles
                .Split(',', StringSplitOptions.RemoveEmptyEntries) // Split by comma and remove empty entries
                .Select(role =>
                {
                    // Try to parse the role string into a RoleEnum
                    if (Enum.TryParse<RoleEnum>(role.Trim(), true, out var parsedRole))
                    {
                        return parsedRole;
                    }

                    return (RoleEnum?)null; // Return null if parsing fails
                })
                .Where(role => role.HasValue) // Filter out null values
                .Select(role => role.Value)  // Select the actual enum values
                .ToList();

            return roles;
        }
    }
}
