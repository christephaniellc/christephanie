using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.User.Find.Commands
{
    /// <summary>
    /// Class FindUserQuery used to get a GuestDto.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="InvitationCode">Invitation Code</param>
    /// <param name="FirstName">FirstName</param>
    public record FindUserQuery(
        string InvitationCode, string FirstName) : IWeddingQuery;
}
