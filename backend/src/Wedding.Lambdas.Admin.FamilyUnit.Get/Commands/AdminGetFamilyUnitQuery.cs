using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Get.Commands
{
    /// <summary>
    /// Class AdminGetFamilyUnitHandler used to get a FamilyUnitDto.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="InvitationCode">Invitation code</param>
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    public record AdminGetFamilyUnitQuery(string InvitationCode, AuthContext AuthContext) : IWeddingQuery;
}
