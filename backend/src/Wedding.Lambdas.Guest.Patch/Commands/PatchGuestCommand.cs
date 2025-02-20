using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Guest.Patch.Commands
{
    /// <summary>
    /// Class PatchGuestCommand used to patch a guest.
    /// Implements the <see cref="IWeddingCommand" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    public record PatchGuestCommand(
        AuthContext AuthContext,
        string GuestId,
        string? Auth0Id = null,
        string? Email = null,
        string? Phone = null,
        RsvpDto? Rsvp = null,
        PreferencesDto? Preferences = null,
        AgeGroupEnum? AgeGroup = null) 
        : IWeddingCommand;
}
