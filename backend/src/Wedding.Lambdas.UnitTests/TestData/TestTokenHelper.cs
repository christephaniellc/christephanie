using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Wedding.Lambdas.UnitTests.TestData
{
    public static class TestTokenHelper
    {

        public static string GenerateTestToken(string authority, string audience, string? guestId = null)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("awwefdvxdae4tw3trdegdrhsefawrq4terdhdrt4tetrdtftyjdrtawerqrsrghcghmghweaasrdkhjknklg"));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, "auth0|user-id"),
                new Claim(JwtRegisteredClaimNames.Email, "john.doe@example.com"),
                new Claim("permissions", "read:guests"),
                new Claim("permissions", "write:guests")
            };
            if (!string.IsNullOrEmpty(guestId))
            {
                claims.Add(new Claim(audience + "/guest_id", guestId));
            }

            var token = new JwtSecurityToken(
                issuer: authority,
                audience: audience,
                claims: claims.ToArray(),
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
