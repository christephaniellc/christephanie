using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Auth.Commands;

namespace Wedding.Common.Auth
{
    public interface IAuthorizationProvider
    {
        Task<GuestDto?> Authorize(ValidateAuthQuery query);
    }
}
