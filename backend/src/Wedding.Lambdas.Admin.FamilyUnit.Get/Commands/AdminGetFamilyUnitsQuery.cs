using System.Collections.Generic;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Get.Commands
{
    /// <summary>
    /// Class AdminGetFamilyUnitHandler used to get a FamilyUnitDto.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="CurrentUserRoles">Roles of current logged in user</param>
    public record AdminGetFamilyUnitsQuery(List<RoleEnum> CurrentUserRoles) : IWeddingQuery;
}
