using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Dtos.ClientInfo;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.User.Patch.Commands
{
    /// <summary>
    /// Class UpdateUserQuery used to update a GuestDto.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="ClientInfo">ClientInfo</param>
    public record PatchUserCommand(
        AuthContext AuthContext, ClientInfoDto ClientInfo) : IWeddingCommand;
}
