using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Notify.Email.Commands
{
    /// <summary>
    /// Class GetEmailNotificationsQuery used to get notifications sent.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    public record GetEmailNotificationsQuery(AuthContext AuthContext) : IWeddingQuery;
}
