using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Validate.Email.Commands
{
    public record RegisterEmailCommand(
        AuthContext AuthContext, string Email) : IWeddingCommand;
}
