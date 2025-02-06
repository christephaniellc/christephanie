using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Validate.Phone.Commands
{
    public record ResendCodeCommand(
        AuthContext AuthContext) : IWeddingQuery;
}
