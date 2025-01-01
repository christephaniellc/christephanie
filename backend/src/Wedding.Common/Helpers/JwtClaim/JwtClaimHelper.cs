using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text.Json;

namespace Wedding.Common.Helpers.JwtClaim
{
    public static class JwtClaimHelper
    {
        public static string? GetSubId(this JwtSecurityToken token)
        {
            return token.Claims.FirstOrDefault(c => c.Type == JwtClaimUris.sub || c.Type == "sub")?.Value;
        }
        public static string? GetGuestId(this JwtSecurityToken token, string audience)
        {
            Console.WriteLine($"Claims: {token.Claims}");
            Console.WriteLine($"Looking for: {audience}/guest_id");
            Console.WriteLine($"Found?: {token.Claims.FirstOrDefault(c => c.Type == $"{audience}/guest_id")?.Value}");
            return token.Claims.FirstOrDefault(c => c.Type == $"{audience}/guest_id")?.Value;
        }

        public static string GetGuestIdFromToken(string token, string audience)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

            var jwtToken = jwtTokenHandler.ReadJwtToken(token);
            Console.WriteLine($"JwtClaimHelper token: {JsonSerializer.Serialize(jwtToken)}");
            var guestId = jwtToken.GetGuestId(audience);

            if (string.IsNullOrEmpty(guestId))
                throw new UnauthorizedAccessException("Invalid token");

            return guestId;
        }
    }
}
