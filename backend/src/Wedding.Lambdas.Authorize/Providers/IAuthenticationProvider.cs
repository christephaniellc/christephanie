using System.Threading.Tasks;
using Wedding.Abstractions.Dtos.Auth0;

namespace Wedding.Lambdas.Authorize.Providers
{
    public interface IAuthenticationProvider
    {
        string GetAudience();
        Task<Auth0User> GetUserInfo(string token);
    }
}
