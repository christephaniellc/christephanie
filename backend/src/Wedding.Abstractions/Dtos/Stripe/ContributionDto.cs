namespace Wedding.Abstractions.Dtos.Stripe
{
    public class ContributionDto
    {
        public string PaymentIntentId { get; set; }
        public string GuestId { get; set; }
        public string InvitationCode { get; set; }
        public int Amount { get; set; }
        public string Currency { get; set; }
        public string GiftCategory { get; set; }
        public string GiftNotes { get; set; }
        public string GuestName { get; set; }
        public bool IsAnonymous { get; set; }
        /// <summary>
        /// Payment status from Stripe (succeeded, processing, requires_payment_method, etc.)
        /// </summary>
        public string Status { get; set; }
        public string Timestamp { get; set; }
    }
}
