using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Payments.Intent.Confirm.Commands
{
    /// <summary>
    /// Class GetStatsQuery used to get Stats.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    public record GetPaymentIntentStatusQuery(string RequestBodyJson, string? SignatureHeader) : IWeddingQuery;
}
