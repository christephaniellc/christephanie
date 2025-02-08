using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Validate.Phone.Commands
{
    public record RegisterPhoneCommand(
        AuthContext AuthContext, string PhoneNumber) : IWeddingQuery;
}
