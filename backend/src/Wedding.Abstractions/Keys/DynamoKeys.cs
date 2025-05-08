using System;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Keys
{
    public static class DynamoKeys
    {
        public const string FamilyUnit = "FAMILY";
        public const string FamilyInfo = "FAMINFO";
        public const string Guest = "GUEST";
        public const string Config = "CONFIG";
        public const string Invitation = "INVITATION";
        public const string Payment = "PAYMENT";
        public const string EmailNotification = "EMAIL";
        public const string NotificationCampaign = "CAMPAIGN";
        public const string GiftCategory = "CATEGORY";
        public const string GiftMetadata = "METADATA";
        public const string GuestInfo = "GUESTINFO";
        public const string Rsvp = "RSVP";
        public const string Preferences = "PREFS";
        public const string GuestIdIndex = "GuestIdIndex";
        public const string AllConfigsIndex = "AllConfigsIndex";

        public static string GetPartitionKey(string invitationCode)
        {
            return $"{DynamoKeys.FamilyUnit}#{invitationCode.ToUpper()}";
        }

        public static string GetFamilyInfoSortKey()
        {
            return DynamoKeys.FamilyInfo;
        }

        public static string GetFamilyUnitName(string firstName, string lastName)
        {
            return $"{lastName}_{firstName} Family";
        }

        public static string GetGuestSortKey(string guestId)
        {
            return $"{DynamoKeys.Guest}#{guestId}";
        }

        public static string GetConfigurationPartitionKey(string guestId)
        {
            return $"{DynamoKeys.Guest}#{guestId}";
        }

        public static string GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum designType, string? designId = null)
        {
            var sortKey = $"{DynamoKeys.Config}#{designType.ToString().ToUpper()}";
            if (designId != null)
            {
                sortKey += $"#{designId}";
            }
            return sortKey;
        }

        public static string GetPaymentPartitionKey(string guestId)
        {
            return $"{DynamoKeys.Guest}#{guestId}";
        }

        public static string GetPaymentSortKey(GiftCategoryEnum giftCategoryType, string? paymentId = null)
        {
            var sortKey = $"{DynamoKeys.Payment}#{giftCategoryType.ToString().ToUpper()}";
            if (paymentId != null)
            {
                sortKey += $"#{paymentId}";
            }
            return sortKey;
        }

        public static class PaymentKeys
        {
            public static string GetPartitionKey(string paymentIntentId) => $"{DynamoKeys.Payment}#{paymentIntentId}";
            public static string GetSortKey(string timestamp) => $"{DynamoKeys.GiftMetadata}#{timestamp}";

            public static string GetGuestIdGSI(string guestId) => $"{DynamoKeys.Guest}#{guestId}";
            public static string GetGiftCategoryGSI(string category) => $"{DynamoKeys.GiftCategory}#{category}";
        }

        public static class NotificationKeys
        {
            public static string GetPartitionKey(string guestId) => $"{DynamoKeys.EmailNotification}#{guestId}"; 
            public static string GetSortKey(string timestamp, CampaignTypeEnum campaignType)
            {
                var type = GetCampaignType(campaignType);
                return $"{timestamp}#{type}";
            }

            public static string GetCampaignType(CampaignTypeEnum campaignType)
            {
                var memberInfo = typeof(CampaignTypeEnum).GetMember(campaignType.ToString()).FirstOrDefault();
                var enumMember = memberInfo?.GetCustomAttribute<EnumMemberAttribute>();
                return enumMember?.Value ?? campaignType.ToString();
            }

            public static string GetCampaignIdGSI(string campaignId) => $"{DynamoKeys.NotificationCampaign}#{campaignId}";

        }
    }
}
