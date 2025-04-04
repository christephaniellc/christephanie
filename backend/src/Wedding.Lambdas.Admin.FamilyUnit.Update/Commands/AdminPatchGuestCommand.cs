using System.Collections.Generic;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Commands
{
    /// <summary>
    /// Class AdminPatchGuestCommand used to patch a guest.
    /// Implements the <see cref="IWeddingCommand" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    public record AdminPatchGuestCommand(
        AuthContext AuthContext,
        string InvitationCode,
        string GuestId,
        string? FirstName = null,
        List<string>? AdditionalFirstNames = null,
        string? LastName = null,
        string? Tier = null,
        string? Email = null,
        string? Phone = null,
        InvitationResponseEnum? InvitationResponse = null,
        RsvpEnum? RehearsalDinner = null,
        RsvpEnum? FourthOfJuly = null,
        RsvpEnum? Wedding = null)
        : IWeddingCommand;
}
