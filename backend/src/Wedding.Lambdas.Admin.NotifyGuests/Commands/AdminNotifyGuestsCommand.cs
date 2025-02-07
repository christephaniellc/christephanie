using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.NotifyGuests.Commands
{
    /// <summary>
    /// Class AdminNotifyGuestsCommand used to get a FamilyUnit.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="NotificationType">Type of notification</param>
    public record AdminNotifyGuestsCommand(AuthContext AuthContext, NotificationTypeEnum NotificationType) : IWeddingQuery;
}
