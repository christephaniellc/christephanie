using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Wedding.Common.Helpers.JwtClaim
{
    public static class ValidationTokenProvider
    {
        public static string GenerateJwtToken(
            string jwtAudience, 
            string invitationCode, 
            string guestId, 
            string code,
            string secretKey,
            DateTime? tokenExpiration = null)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);

            // Create the token descriptor with our custom claims
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("jwtAudience", jwtAudience),
                    new Claim("invitationCode", invitationCode),
                    new Claim("guestId", guestId),
                    new Claim("code", code)
                }),

                Expires = tokenExpiration ?? DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            // Create and write the token
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public static ClaimsPrincipal DecodeJwtToken(string token, string secretKey)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);

            // Setup token validation parameters
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                // Set these to false if you are not validating issuer or audience
                ValidateIssuer = false,
                ValidateAudience = false,
                // Optionally set the clock skew to zero so tokens expire exactly at token expiration time (default is 5 minutes)
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                // Validate the token and return the principal (claims)
                ClaimsPrincipal principal =
                    tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch (Exception ex)
            {
                // Token validation failed; handle accordingly (log exception, rethrow, etc.)
                Console.WriteLine($"Token validation failed: {ex.Message}");
                return null;
            }
        }


        // Generates a 256-bit (32-byte) key suitable for HMAC-SHA256 and returns it in a URL-safe Base64 string.
        public static string GenerateSecretKey()
        {
            byte[] key = new byte[32]; // 32 bytes = 256 bits
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(key);
            }

            // Convert to Base64
            string base64Key = Convert.ToBase64String(key);

            // Make the Base64 string URL safe by replacing '+' with '-', '/' with '_', and removing '=' padding.
            string urlSafeKey = base64Key.Replace('+', '-').Replace('/', '_').TrimEnd('=');
            return urlSafeKey;
        }
    }
}
