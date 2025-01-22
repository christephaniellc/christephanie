using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Wedding.Common.Configuration;

namespace Wedding.Lambdas.UnitTests.TestData
{
    public class TestTokenHelper
    {
        public string JwtAuthority { get; }
        public string JwtAudience { get; }
        public string ClientId { get; }
        public string ClientSecret { get; }
        public string TokenEndpoint { get; }

        public TestTokenHelper(IConfigurationRoot configuration)
        {
            JwtAuthority = configuration[ConfigurationKeys.AuthenticationAuthority];
            JwtAudience = configuration[ConfigurationKeys.AuthenticationAudience];
            ClientId = configuration[ConfigurationKeys.AuthenticationClientIdM2M];
            ClientSecret = configuration[ConfigurationKeys.AuthenticationClientSecretM2M];
            TokenEndpoint = JwtAuthority + "/oauth/token";
        }

        public async Task<string> GenerateAuth0Token(string? guestId = null)
        {
            var requestBody = new
            {
                client_id = ClientId,
                client_secret = ClientSecret,
                audience = JwtAudience,
                grant_type = "client_credentials"
            };
            var requestBodyGuest = new
            {
                client_id = ClientId,
                client_secret = ClientSecret,
                audience = JwtAudience,
                grant_type = "client_credentials",
                guest_id = guestId!
            };

            StringContent content;
            if (string.IsNullOrEmpty(guestId))
            {
                content = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json");
            }
            else
            {
                content = new StringContent(
                    JsonSerializer.Serialize(requestBodyGuest),
                    Encoding.UTF8,
                    "application/json");
            }

            using (var httpClient = new HttpClient())
            {
                var response = await httpClient.PostAsync(TokenEndpoint, content);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();
                var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(responseBody);

                return tokenResponse.access_token;
            }
        }

        public class TokenResponse
        {
            [JsonPropertyName("access_token")]
            public string access_token { get; set; }
            [JsonPropertyName("expires_in")]
            public int expires_in { get; set; }
            [JsonPropertyName("token_type")]
            public string token_type { get; set; }
        }

        // public static string GenerateTestToken(string authority, string audience, string? guestId = null)
        // {
        //     var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("awwefdvxdae4tw3trdegdrhsefawrq4terdhdrt4tetrdtftyjdrtawerqrsrghcghmghweaasrdkhjknklg"));
        //     var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        //
        //     var claims = new List<Claim>
        //     {
        //         new Claim(JwtRegisteredClaimNames.Sub, "auth0|user-id"),
        //         new Claim(JwtRegisteredClaimNames.Email, "john.doe@example.com"),
        //         new Claim("permissions", "read:guests"),
        //         new Claim("permissions", "write:guests")
        //     };
        //     if (!string.IsNullOrEmpty(guestId))
        //     {
        //         claims.Add(new Claim(audience + "/guest_id", guestId));
        //     }
        //
        //     var token = new JwtSecurityToken(
        //         issuer: authority,
        //         audience: audience,
        //         claims: claims.ToArray(),
        //         expires: DateTime.Now.AddHours(1),
        //         signingCredentials: credentials);
        //
        //     return new JwtSecurityTokenHandler().WriteToken(token);
        // }
    }
}
