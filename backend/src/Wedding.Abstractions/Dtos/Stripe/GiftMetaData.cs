namespace Wedding.Abstractions.Dtos.Stripe
{
    public class GiftMetaData
    {
        public string GuestId { get; set; }
        public string InvitationCode { get; set; }
        public string Audience { get; set; }
        public string GuestName { get; set; }
        public bool IsAnonymous { get; set; } = false;

        /// <summary>
        /// Guest email for receipt
        /// </summary>
        public string? GuestEmail { get; set; }

        /// <summary>
        /// "honeymoon", Category/purpose of the gift
        /// </summary>
        public string? GiftCategory { get; set; }

        /// <summary>
        /// Guest-entered notes
        /// </summary>
        public string? GiftNotes { get; set; }
    }
}
