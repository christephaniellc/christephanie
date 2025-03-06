using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Validate.Phone.Commands
{
    public record ResendPhoneCodeCommand(
        AuthContext AuthContext) : IWeddingCommand;
}
