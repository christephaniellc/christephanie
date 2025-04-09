using System.Threading.Tasks;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Abstractions.Dtos;
using System.Threading;

namespace Wedding.Common.ThirdParty
{
    public interface IStripePaymentProvider
    {
        Task<StripePaymentIntentResponseDto> CreatePaymentIntent(GuestDto guest, int amount, string currency, GiftMetaData giftMetaData, CancellationToken cancellationToken = default(CancellationToken));
        
        /// <summary>
        /// Retrieves a payment intent by its ID and verifies its status
        /// </summary>
        /// <param name="paymentIntentId">The ID of the payment intent to retrieve</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>A response containing the payment intent details or an error</returns>
        Task<StripePaymentIntentResponseDto> GetPaymentIntent(string paymentIntentId, CancellationToken cancellationToken = default(CancellationToken));
    }
}
