using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.User.Get.Commands
{
    /// <summary>
    /// Class GetUserQuery used to get a GuestDto.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="AuthContext">Auth Context for guest</param>
    public record GetUserQuery(AuthContext AuthContext) : IWeddingQuery;
}
