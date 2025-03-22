using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Verify.Email.Commands
{
    /// <summary>
    /// Class VerifyEmailCommand used to verify email address
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="Token">Token</param>
    public record VerifyEmailCommand(
        string JwtAuthority,
        string JwtAudience,
        string? Token) : IWeddingQuery;
}
