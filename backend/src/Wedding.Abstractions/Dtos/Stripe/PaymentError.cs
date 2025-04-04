using System.Text.Json.Serialization;

namespace Wedding.Abstractions.Dtos.Stripe
{
    public class PaymentError
    {
        /// <summary>
        /// E.g., "card_error"
        /// </summary>
        [JsonPropertyName("type")]
        public string? Type { get; set; }

        /// <summary>
        /// E.g., "Your card was declined"
        /// </summary>
        [JsonPropertyName("message")]
        public string? Message { get; set; }

        /// <summary>
        /// E.g., "card_declined"
        /// </summary>
        [JsonPropertyName("code")]
        public string? Code { get; set; }

        /// <summary>
        /// E.g., "insufficient_funds"
        /// </summary>
        [JsonPropertyName("decline_code")]
        public string? DeclineCode { get; set; }
    }
}
