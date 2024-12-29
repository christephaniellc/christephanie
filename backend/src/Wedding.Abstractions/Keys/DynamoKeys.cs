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
        public const string GuestIdIndex = "GuestIdIndex";

        public static string GetFamilyUnitPartitionKey(string invitationCode)
        {
            return $"{DynamoKeys.FamilyUnit}#{invitationCode}";
        }

        public static string GetFamilyInfoSortKey()
        {
            return DynamoKeys.FamilyInfo;
        }

        public static string GetFamilyUnitName(string firstName, string lastName)
        {
            return $"{lastName}_{firstName} Family";
        }

        public static string GetGuestPartitionKey(string invitationCode)
        {
            return $"{DynamoKeys.FamilyUnit}#{invitationCode}";
        }

        public static string GetGuestSortKey(string guestId)
        {
            return $"{DynamoKeys.Guest}#{guestId}";
        }
    }
}
