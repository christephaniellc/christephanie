using System;
using System.Collections.Generic;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands
{
    /// <summary>
    /// Class DeleteFamilyUnitCommand used to delete a FamilyUnit.
    /// Implements the <see cref="IWeddingCommand" />
    /// Implements the <see cref="IEquatable{T}" />
    /// </summary>
    /// <seealso cref="IWeddingCommand" />
    /// <seealso cref="IEquatable{DeleteSiteCommand}" />
    /// <param name="Id">The Id of the Site</param>
    public record AdminDeleteFamilyUnitCommand(
        string InvitationCode, List<RoleEnum> CurrentUserRoles) : IWeddingCommand;
}
