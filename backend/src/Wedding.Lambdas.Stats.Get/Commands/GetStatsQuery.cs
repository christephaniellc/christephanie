using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Stats.Get.Commands
{
    /// <summary>
    /// Class GetStatsQuery used to get Stats.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    public record GetStatsQuery(AuthContext AuthContext) : IWeddingQuery;
}
