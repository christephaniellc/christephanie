using System.Threading.Tasks;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Abstractions.Dtos;
using System.Threading;

namespace Wedding.Common.ThirdParty
{
    public interface IStripePaymentProvider
    {
        Task<StripePaymentIntentResponseDto> CreatePaymentIntent(GuestDto guest, int amount, string currency, GiftMetaData giftMetaData, CancellationToken cancellationToken = default(CancellationToken));
    }
}
