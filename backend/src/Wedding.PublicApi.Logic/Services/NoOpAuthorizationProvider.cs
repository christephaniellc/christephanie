using Amazon.Lambda.APIGatewayEvents;
using System.Collections.Generic;
using System.Net;

namespace Wedding.PublicApi.Logic.Services
{
    public class NoOpAuthorizationProvider : IAuthorizationProvider
    {
        private readonly bool _isAdmin;

        public NoOpAuthorizationProvider(bool isAdmin)
        {
            _isAdmin = isAdmin;
        }

        public AuthResponse ValidateAuthToken(IDictionary<string, string> headers, bool needsAdmin = false)
        {
            var response = new AuthResponse
            {
                AuthToken = "fakeToken",
                Claims = new Dictionary<string, List<string>>(),
                Response = new APIGatewayProxyResponse
                {
                    StatusCode = (int)HttpStatusCode.OK,
                    Body = "NoOpAuthorizationProvider"
                },
                Authorized = true
            };
            return needsAdmin ? ValidateAdminClaims(response) : response;
        }

        public AuthResponse ValidateAdminClaims(AuthResponse response)
        {
            return new AuthResponse
            {
                AuthToken = "fakeToken",
                Claims = new Dictionary<string, List<string>>(),
                Response = new APIGatewayProxyResponse
                {
                    StatusCode = _isAdmin ? (int)HttpStatusCode.OK : (int)HttpStatusCode.Unauthorized,
                    Body = "NoOpAuthorizationProvider: unauthorized"
                },
                Authorized = _isAdmin
            };
        }
    }
}
