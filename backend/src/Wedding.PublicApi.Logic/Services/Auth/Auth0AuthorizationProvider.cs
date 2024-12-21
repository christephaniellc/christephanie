using System.Net;
using System.Threading.Tasks;
using Wedding.PublicApi.Logic.Helpers;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    /// <summary>
    /// Checks permissions for the user.
    /// </summary>
    public class Auth0AuthorizationProvider : IAuthorizationProvider
    {
        private readonly string _baseUrl;

        public static AuthResponse UNAUTHORIZED = new AuthResponse
        {
            ResponseStatusCode = HttpStatusCode.Unauthorized,
            ResponseMessage = "You do not have access."
        };

        public Auth0AuthorizationProvider(string baseUrl)
        {
            _baseUrl = baseUrl;
        }
        
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async Task<AuthResponse> ValidateAdminClaims(AuthResponse response)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            if (response.AuthToken is null)
            {
                return UNAUTHORIZED;
            }

            try
            {
                response.Claims = JwtHelper.ParseJwt(response.AuthToken);
                if (response.Claims == null || 
                    !response.Claims.ContainsKey(string.Format("{0}/roles", _baseUrl)) ||
                    !response.Claims[string.Format("{0}/roles", _baseUrl)].Contains("admin"))
                {
                    response = UNAUTHORIZED;
                }
                else
                {
                    response.Authorized = true;
                }
            }
            catch
            {
                response = UNAUTHORIZED;
            }

            return response;
        }
    }
}
