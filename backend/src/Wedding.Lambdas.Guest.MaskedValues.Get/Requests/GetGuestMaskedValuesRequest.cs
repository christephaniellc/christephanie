using Wedding.Abstractions.Enums;

namespace Wedding.Lambdas.Guest.MaskedValues.Get.Requests
{
    public class GetGuestMaskedValuesRequest
    {
        public required string GuestId { get; set; }
        public required NotificationPreferenceEnum MaskedValueType { get; set; }
    }
}
