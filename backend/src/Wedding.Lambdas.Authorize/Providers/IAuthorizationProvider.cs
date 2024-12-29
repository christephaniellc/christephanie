using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;

namespace Wedding.Lambdas.Authorize.Providers
{
    public interface IAuthorizationProvider
    {
        Task<GuestDto?> Authorize(string token, string methodArn);
    }
}
