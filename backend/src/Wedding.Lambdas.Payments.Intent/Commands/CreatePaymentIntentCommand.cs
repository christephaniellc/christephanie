using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Payments.Intent.Commands
{
    /// <summary>
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="AuthContext">AuthContext of current logged in user</param>
    public record CreatePaymentIntentCommand(AuthContext AuthContext, 
        int Amount,
        string Currency,
        string GuestEmail,
        GiftMetaData? GiftMetaData) : IWeddingCommand;
}
