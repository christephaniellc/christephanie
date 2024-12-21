using System.Collections.Generic;
using System.Threading.Tasks;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public interface IAuthenticationProvider
    {
        Task<AuthResponse> ValidateAuthToken(IDictionary<string, string> headers, bool needsAdmin = false);
    }
}
