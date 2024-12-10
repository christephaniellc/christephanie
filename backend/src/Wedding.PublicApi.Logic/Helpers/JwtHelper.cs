using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;

namespace Wedding.PublicApi.Logic.Helpers
{
    public static class JwtHelper
    {
        public static Dictionary<string, List<string>> ParseJwt(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token.Replace("Bearer ", ""));
            var claims = new Dictionary<string, List<string>>();

            foreach (var claim in jwt.Claims)
            {
                if (!claims.ContainsKey(claim.Type))
                {
                    claims[claim.Type] = new List<string>();
                }
                claims[claim.Type].Add(claim.Value);
            }

            return claims;
        }
    }

}
