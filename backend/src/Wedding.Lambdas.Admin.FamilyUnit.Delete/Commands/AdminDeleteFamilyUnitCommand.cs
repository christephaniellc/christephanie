using System;
using Wedding.Abstractions.Dtos.Auth;
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
    /// <param name="InvitationCode">InvitationCode to delete</param>
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    public record AdminDeleteFamilyUnitCommand(
        string InvitationCode, AuthContext AuthContext) : IWeddingCommand;
}
