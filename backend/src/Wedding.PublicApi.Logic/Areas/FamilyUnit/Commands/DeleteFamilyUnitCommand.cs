using System;
using Wedding.Common.Dispatchers;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands
{
    /// <summary>
    /// Class DeleteFamilyUnitCommand used to delete a FamilyUnit.
    /// Implements the <see cref="IWeddingCommand" />
    /// Implements the <see cref="IEquatable{T}" />
    /// </summary>
    /// <seealso cref="IWeddingCommand" />
    /// <seealso cref="IEquatable{DeleteSiteCommand}" />
    /// <param name="Id">The Id of the Site</param>
    public record DeleteFamilyUnitCommand(
        string RsvpCode) : IWeddingCommand;
}
