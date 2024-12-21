using Amazon.DynamoDBv2.Model;

namespace Wedding.Abstractions.Keys
{
    public static class DynamoKeys
    {
        public const string FamilyUnit = "FAMILY";
        public const string FamilyInfo = "FAMINFO";
        public const string Guest = "GUEST";
        public const string GuestInfo = "GUESTINFO";
        public const string Rsvp = "RSVP";
        public const string Preferences = "PREFS";

        public static string GetFamilyUnitPartitionKey(string rsvpCode)
        {
            return $"{DynamoKeys.FamilyUnit}#{rsvpCode}";
        }

        public static string GetFamilyInfoSortKey()
        {
            return DynamoKeys.FamilyInfo;
        }

        public static string GetFamilyUnitName(string firstName, string lastName)
        {
            return $"{lastName}_{firstName} Family";
        }

        public static string GetGuestPartitionKey(string rsvpCode)
        {
            return $"{DynamoKeys.FamilyUnit}#{rsvpCode}";
        }

        public static string GetGuestSortKey(string guestId)
        {
            return $"{DynamoKeys.Guest}#{guestId}";
        }
    }
}
