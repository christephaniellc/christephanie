using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;
using Wedding.Lambdas.Authorize.Commands;

namespace Wedding.Lambdas.Authorize.Providers
{
    public interface IAuthorizationProvider
    {
        Task<GuestDto?> Authorize(ValidateAuthQuery query);
    }
}
