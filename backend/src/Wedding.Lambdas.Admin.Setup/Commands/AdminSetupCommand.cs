using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.Setup.Commands
{
    /// <summary>
    /// Class AdminSetupCommand used to get a GuestDto.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="Audience">API audience</param>
    /// <param name="InvitationCode">Invitation Code</param>
    /// <param name="FirstName">FirstName</param>
    public record AdminSetupCommand(
        string Audience, string InvitationCode, string FirstName) : IWeddingQuery;
}
