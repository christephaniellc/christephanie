using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Abstractions.Enums;
using Wedding.Lambdas.Authorize.Enums;
using Wedding.Lambdas.Authorize.Providers;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public class NoOpAuthorizationProvider : IAuthorizationProvider, IAuthenticationProvider 
    {
        private readonly bool _isAdmin;

        public NoOpAuthorizationProvider(bool isAdmin)
        {
            _isAdmin = isAdmin;
        }

        public async Task<AuthResponse> ValidateAuthToken(IDictionary<string, string> headers, bool needsAdmin = false)
        {
            var response = new AuthResponse
            {
                AuthToken = "fakeToken",
                Claims = new Dictionary<string, List<string>>(),
                ResponseStatusCode = HttpStatusCode.OK,
                ResponseMessage = "NoOpAuthorizationProvider",
                Authorized = true
            };
            return needsAdmin ? await ValidateAdminClaims(response) : response;
        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public async Task<AuthResponse> ValidateAdminClaims(AuthResponse response)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {
            return new AuthResponse
            {
                AuthToken = "fakeToken",
                Claims = new Dictionary<string, List<string>>(),
                ResponseStatusCode = _isAdmin ? HttpStatusCode.OK : HttpStatusCode.Unauthorized,
                ResponseMessage = "NoOpAuthorizationProvider: " + (_isAdmin ? "authorized" : "unauthorized"),
                Authorized = _isAdmin
            };
        }

        public Task<APIGatewayCustomAuthorizerResponse> IsAuthorized(string token, string methodArn)
        {
            throw new System.NotImplementedException();
        }

        public APIGatewayCustomAuthorizerResponse GeneratePolicy(PolicyEffectEnum effect, string methodArn, string? userId = null,
            List<RoleEnum>? roles = null)
        {
            throw new System.NotImplementedException();
        }
    }
}
