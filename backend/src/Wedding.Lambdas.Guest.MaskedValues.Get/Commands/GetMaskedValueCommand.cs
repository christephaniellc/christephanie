using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Guest.MaskedValues.Get.Commands
{
    /// <summary>
    /// Class PatchGuestCommand used to patch a guest.
    /// Implements the <see cref="IWeddingCommand" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    public record GetMaskedValueCommand(
        AuthContext AuthContext,
        string GuestId,
        NotificationPreferenceEnum MaskedValueType) 
        : IWeddingCommand;
}
