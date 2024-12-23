using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace Wedding.Common.Helpers.JwtClaim
{
    public static class JwtClaimHelper
    {
        public static string? GetUserId(this JwtSecurityToken token)
        {
            return token.Claims.FirstOrDefault(c => c.Type == JwtClaimUris.sub || c.Type == "sub")?.Value;
        }
    }
}
