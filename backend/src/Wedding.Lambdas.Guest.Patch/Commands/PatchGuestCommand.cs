using System.Collections.Generic;
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
        AgeGroupEnum? AgeGroup = null,
        string? Auth0Id = null,
        string? Email = null,
        string? Phone = null,
        InvitationResponseEnum? InvitationResponse = null,
        RsvpEnum? RehearsalDinner = null,
        RsvpEnum? FourthOfJuly = null,
        RsvpEnum? Wedding = null,
        string? RsvpNotes = null,
        List<NotificationPreferenceEnum>? NotificationPreference = null,
        SleepPreferenceEnum? SleepPreference = null,
        FoodPreferenceEnum? FoodPreference = null,
        List<string>? FoodAllergies = null,
        bool? AllowBetaScreenRecordings = null) 
        : IWeddingCommand;
}
