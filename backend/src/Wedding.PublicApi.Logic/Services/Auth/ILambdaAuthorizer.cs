using System.Threading.Tasks;
using System.Threading;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Abstractions.Dtos.Auth;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public interface ILambdaAuthorizer
    {
        Task<AuthContext> GetAsync(ValidateAuthQuery query, CancellationToken cancellationToken = default(CancellationToken));
    }
}
