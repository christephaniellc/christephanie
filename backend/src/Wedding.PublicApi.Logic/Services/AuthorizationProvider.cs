using System.Collections.Generic;
using System.Net;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.PublicApi.Logic.Helpers;

namespace Wedding.PublicApi.Logic.Services
{
    /// <summary>
    /// Checks permissions for the user.
    /// </summary>
    public class AuthorizationProvider : IAuthorizationProvider
    {
        private readonly string _baseUrl;

        APIGatewayProxyResponse UNAUTHORIZED = new APIGatewayProxyResponse
        {
            StatusCode = (int)HttpStatusCode.Unauthorized,
            Body = "You do not have access."
        };

        public AuthorizationProvider(string baseUrl)
        {
            _baseUrl = baseUrl;
        }

        public string? ParseAuthToken(IDictionary<string, string> headers)
        {
            var success = !headers.TryGetValue("Authorization", out var authToken) 
                          && !string.IsNullOrEmpty(authToken);
            if (!success)
            {
                return null;
            }
            return authToken;
        }

        public AuthResponse ValidateAuthToken(IDictionary<string, string> headers, bool needsAdmin = false)
        {
            var response = new AuthResponse();

            response.AuthToken = ParseAuthToken(headers);
            if (response.AuthToken is null)
            {
                response.Response = UNAUTHORIZED;
                response.Response.Body = "Authorization token is missing or invalid.";
            }
            return needsAdmin ? ValidateAdminClaims(response) : response;
        }

        public AuthResponse ValidateAdminClaims(AuthResponse response)
        {
            if (response.AuthToken is null)
            {
                response.Response = UNAUTHORIZED;
                return response;
            }

            try
            {
                response.Claims = JwtHelper.ParseJwt(response.AuthToken);
                if (!response.Claims.ContainsKey(string.Format("{0}/roles", _baseUrl)) ||
                    !response.Claims[string.Format("{0}/roles", _baseUrl)].Contains("admin"))
                {
                    response.Response = UNAUTHORIZED;
                }
                else
                {
                    response.Authorized = true;
                }
            }
            catch
            {
                response.Response = UNAUTHORIZED;
            }

            return response;
        }
    }
}
