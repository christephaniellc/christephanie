using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Validate.Email.Commands
{
    public record ValidateEmailCommand(
        AuthContext AuthContext, string Code) : IWeddingCommand;
}
