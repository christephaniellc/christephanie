using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.Configuration.Invitation.Commands
{
    /// <summary>
    /// Class AdminGetFamilyUnitHandler used to get a FamilyUnitDto.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    public record AdminGetPhotoConfigurationsQuery(AuthContext AuthContext) : IWeddingQuery;
}
