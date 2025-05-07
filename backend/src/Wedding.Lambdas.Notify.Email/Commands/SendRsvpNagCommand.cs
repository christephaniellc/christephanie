using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Notify.Email.Commands
{
    /// <summary>
    /// Class SendRsvpNagCommand used to send RSVP notification email nag.
    /// Implements the <see cref="IWeddingCommand" />
    /// </summary>
    /// <seealso cref="IWeddingCommand" />
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    /// <param name="GuestId">Optional guest id to send to particular guest</param>
    public record SendRsvpNagCommand(AuthContext AuthContext, string? GuestId) : IWeddingCommand;
}
