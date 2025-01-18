using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Auth.Commands;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public interface ILambdaAuthorizer
    {
        Task<AuthContext> GetAsync(ValidateAuthQuery query, CancellationToken cancellationToken = default(CancellationToken));
    }
}
