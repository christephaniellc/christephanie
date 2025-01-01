using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using FluentValidation;
using Microsoft.IdentityModel.Tokens;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    /// <summary>
    /// Validator for JwtTokens.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    public class JwtTokenValidator : AbstractValidator<string>, IValidate<string>
    {
        public JwtTokenValidator(string authority, string audience)
        {
            RuleFor(jwtToken => jwtToken)
                .NotEmpty()
                .WithMessage("Token cannot be empty.")
                .Must(token => BeAValidJwt(token, authority, audience))
                .WithMessage("Invalid JWT token.");
        }

        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="_">The .</param>
        public void IsValid(string? obj, object? _ = null)
            => this!.ValidateAndThrow(obj);

        /// <summary>
        /// Validates JwtToken
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        private bool BeAValidJwt(string token, string authority, string audience)
        {
            Console.WriteLine($"BeAValidJwt: {token}");
            if (string.IsNullOrWhiteSpace(token))
                return false;

            var tokenHandler = new JwtSecurityTokenHandler();
            if (!tokenHandler.CanReadToken(token))
                return false;
            Console.WriteLine($"Can read token.");

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = $"{authority}/",
                    ValidateAudience = true,
                    ValidAudience = audience,
                    ValidateLifetime = true,
                    IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
                    {
                        var client = new HttpClient();
                        Console.WriteLine($"JwtTokenValidator authority: {authority}");
                        var keys = client.GetStringAsync($"{authority}/.well-known/jwks.json").Result;
                        Console.WriteLine($"JwtTokenValidator keys: {keys}");
                        var jsonWebKeySet = new JsonWebKeySet(keys);
                        return jsonWebKeySet.GetSigningKeys();
                    }
                };

                tokenHandler.ValidateToken(token, validationParameters, out _);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
