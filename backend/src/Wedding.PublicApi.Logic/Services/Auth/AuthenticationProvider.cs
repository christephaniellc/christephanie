using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Wedding.PublicApi.Logic.Helpers;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    /// <summary>
    /// Authenticates with Auth0
    /// </summary>
    public class AuthenticationProvider : IAuthenticationProvider
    {
        private readonly IAuthorizationProvider _authorizationProvider;
        private readonly string _baseUrl;

        public AuthenticationProvider(IAuthorizationProvider authorizationProvider, string baseUrl)
        {
            _authorizationProvider = authorizationProvider;
            _baseUrl = baseUrl;
        }
        
        public async Task<AuthResponse> ValidateAuthToken(IDictionary<string, string> headers, bool needsAdmin = false)
        {
            var response = new AuthResponse();

            response = ParseAuthToken(response, headers);
            if (response.AuthToken is null || string.IsNullOrEmpty(response.Identity))
            {
                response.ResponseStatusCode = HttpStatusCode.Unauthorized;
                response.ResponseMessage = "Authorization token is missing or invalid.";
            }
            return needsAdmin ? await _authorizationProvider.ValidateAdminClaims(response) : response;
        }

        public AuthResponse ParseAuthToken(AuthResponse response, IDictionary<string, string> headers)
        {
            var success = !headers.TryGetValue("Authorization", out var authToken)
                          && !string.IsNullOrEmpty(authToken);

            response.Claims = JwtHelper.ParseJwt(response.AuthToken);
            var subClaim = response.Claims.ContainsKey("sub")
                ? response.Claims["sub"].FirstOrDefault()
                : null;

            if (subClaim is null)
            {
                response.Authorized = false;
            }
            else
            {
                response.Authorized = success;
                response.Identity = subClaim;
            }

            return response;
        }
    }
}
