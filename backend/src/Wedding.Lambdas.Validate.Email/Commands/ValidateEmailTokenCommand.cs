using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Validate.Email.Commands
{
    public record ValidateEmailTokenCommand(
        string Token) : IWeddingCommand;
}
