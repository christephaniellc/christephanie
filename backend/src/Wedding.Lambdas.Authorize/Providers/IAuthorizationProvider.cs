using System.Threading.Tasks;
using Wedding.Abstractions.Dtos.Auth0;

namespace Wedding.Lambdas.Authorize.Providers
{
    public interface IAuthorizationProvider
    {
        Task<Auth0User> Authorize(Auth0User authenticatedUser, string methodArn);
    }
}
