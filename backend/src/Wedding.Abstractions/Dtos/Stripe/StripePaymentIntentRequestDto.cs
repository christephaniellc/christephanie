namespace Wedding.Abstractions.Dtos.Stripe
{
    public class StripePaymentIntentRequestDto
    {
        /// <summary>
        /// // Amount in cents (e.g., 5000 = $50.00)
        /// </summary>
        public int Amount { get; set; } = 0;

        /// <summary>
        /// Currency code (default: "usd")
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// Gift meta data for the payment
        /// </summary>
        public GiftMetaData? GiftMetaData { get; set; } 
    }
}
