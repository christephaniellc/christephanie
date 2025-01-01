using System.Threading.Tasks;
using Wedding.Abstractions.Dtos.Auth;

namespace Wedding.Lambdas.Authorize.Providers
{
    public interface IAuthenticationProvider
    {
        Task<string> GetAudience();
        Task<Auth0User> GetUserInfo(string token);
    }
}
