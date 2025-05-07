using System.Runtime.Serialization;

namespace Wedding.Abstractions.Enums
{
    public enum CampaignTypeEnum
    {
        [EnumMember(Value = "RSVP_NOTIFY")]
        RsvpNotify,

        [EnumMember(Value = "RSVP_REMINDER")]
        RsvpReminder,

        [EnumMember(Value = "MANOR_DETAILS")]
        ManorDetails,

        [EnumMember(Value = "FOURTH_DETAILS")]
        FourthDetails,

        [EnumMember(Value = "WEDDING_DETAILS")]
        WeddingDetails,

        [EnumMember(Value = "THANK_YOU")]
        ThankYou
    }
}
