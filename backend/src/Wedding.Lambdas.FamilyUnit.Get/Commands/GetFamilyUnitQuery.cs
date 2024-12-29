using System.Collections.Generic;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.FamilyUnit.Get.Commands
{
    /// <summary>
    /// Class GetFamilyUnitQuery used to get a FamilyUnit.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="GuestId">The user's guest id</param>
    public record GetFamilyUnitQuery(
        string InvitationCode, string GuestId, List<RoleEnum> Roles) : IWeddingQuery;
}
