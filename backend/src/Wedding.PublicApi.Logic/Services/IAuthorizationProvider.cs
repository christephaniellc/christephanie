using System.Collections.Generic;

namespace Wedding.PublicApi.Logic.Services
{
    public interface IAuthorizationProvider
    {
        AuthResponse ValidateAuthToken(IDictionary<string, string> headers, bool needsAdmin = false);
        AuthResponse ValidateAdminClaims(AuthResponse response);
    }
}
