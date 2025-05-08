using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Notify.Email.Commands
{
    /// <summary>
    /// Class SendEmailNotificationCommand used to send RSVP notification emails.
    /// Implements the <see cref="IWeddingCommand" />
    /// </summary>
    /// <seealso cref="IWeddingCommand" />
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    /// <param name="GuestId">Optional guest id to send to particular guest</param>
    public record SendEmailNotificationCommand(AuthContext AuthContext, CampaignTypeEnum CampaignType, string? GuestId = null) : IWeddingCommand;
}
