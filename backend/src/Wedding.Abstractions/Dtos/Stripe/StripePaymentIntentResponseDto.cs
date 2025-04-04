using System.Text.Json.Serialization;

namespace Wedding.Abstractions.Dtos.Stripe
{
    public class StripePaymentIntentResponseDto
    {
        [JsonPropertyName("clientSecret")]
        public string? ClientSecret { get; set; }

        [JsonPropertyName("paymentIntentId")]
        public string? PaymentIntentId { get; set; }

        [JsonPropertyName("amount")]
        public long? Amount { get; set; }

        [JsonPropertyName("currency")]
        public string? Currency { get; set; }

        [JsonPropertyName("error")]
        public PaymentError? Error { get; set; }
    }
}
