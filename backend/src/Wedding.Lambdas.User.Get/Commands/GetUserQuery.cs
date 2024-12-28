using System.Collections.Generic;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.User.Get.Commands
{
    /// <summary>
    /// Class GetUserQuery used to get a GuestDto.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="GuestId">Auth0 id</param>
    public record GetUserQuery(
        string GuestId, string InvitationCode, List<RoleEnum> Roles) : IWeddingQuery;
}
