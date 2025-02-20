using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.FamilyUnit.Patch.Commands
{
    /// <summary>
    /// Class PatchFamilyUnitCommand used to patch a FamilyUnit.
    /// Implements the <see cref="IWeddingCommand" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    public record PatchFamilyUnitCommand(
        AuthContext AuthContext,
        AddressDto? MailingAddress = null,
        string? InvitationResponseNotes = null) 
        : IWeddingCommand;
}
