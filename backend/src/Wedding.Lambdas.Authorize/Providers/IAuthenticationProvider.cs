using System.Threading.Tasks;
using Wedding.Abstractions.Dtos.Auth0;

namespace Wedding.Lambdas.Authorize.Providers
{
    public interface IAuthenticationProvider
    {
        Task<Auth0User> Authenticate(string token);
    }
}
