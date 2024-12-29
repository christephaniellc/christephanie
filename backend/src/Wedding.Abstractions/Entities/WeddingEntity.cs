using Amazon.DynamoDBv2.DataModel;
using System;
using System.Collections.Generic;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;

namespace Wedding.Abstractions.Entities
{
    [DynamoDBTable("christephanie-wedding")]
    public class WeddingEntity
    {
        [DynamoDBHashKey]
        public string PartitionKey { get; set; }

        [DynamoDBRangeKey]
        public string SortKey { get; set; } = ""; // e.g., "INFO", "GUEST#GuestId"

        [DynamoDBProperty]
        public string InvitationCode { get; set; } = ""; // e.g., "FAMILY#InvitationCode"

        #region Family-specific fields
        /// <summary>
        /// Family-specific fields (used when SortKey = "INFO")
        /// </summary>
        [DynamoDBProperty]
        public string? UnitName { get; set; }

        [DynamoDBProperty]
        public int? PotentialHeadCount { get; set; }

        [DynamoDBProperty]
        public string? MailingAddress { get; set; }

        [DynamoDBProperty]
        public List<string>? AdditionalAddresses { get; set; }

        [DynamoDBProperty]
        public string? InvitationResponseNotes { get; set; }

        [DynamoDBProperty]
        public DateTime? FamilyUnitLastLogin { get; set; }
        #endregion

        #region Guest-specific fields

        /// <summary>
        /// Guest-specific fields (used when SK starts with "GUEST#")
        /// </summary>
        [DynamoDBProperty]
        public string GuestId { get; set; } = "";

        [DynamoDBProperty]
        public int? GuestNumber { get; set; }

        [DynamoDBProperty]
        public string? Auth0Id { get; set; }
        
        [DynamoDBProperty]
        public string? FirstName { get; set; }

        [DynamoDBProperty]
        public List<string>? AdditionalFirstNames { get; set; }

        [DynamoDBProperty]
        public string? LastName { get; set; }

        [DynamoDBProperty]
        public string Tier { get; set; } = "";

        [DynamoDBProperty(typeof(ListEnumToStringConverter<RoleEnum>))]
        public List<RoleEnum> Roles { get; set; }

        [DynamoDBProperty]
        public string? Email { get; set; }

        [DynamoDBProperty]
        public bool EmailVerified { get; set; }

        [DynamoDBProperty]
        public string? Phone { get; set; }

        [DynamoDBProperty(typeof(EnumToStringConverter<AgeGroupEnum>))]
        public AgeGroupEnum? AgeGroup { get; set; }

        [DynamoDBProperty]
        public List<DateTime>? GuestLogins { get; set; }
        #endregion

        #region RSVP-specific fields
        /// <summary>
        /// RSVP-specific fields (used when SortKey = "RSVP")
        /// </summary>
        [DynamoDBProperty(typeof(EnumToStringConverter<InvitationResponseEnum>))]
        public InvitationResponseEnum InvitationResponse { get; set; }

        [DynamoDBProperty(typeof(EnumToStringConverter<RsvpEnum>))]
        public RsvpEnum? RsvpWedding { get; set; }

        [DynamoDBProperty]
        public string? RsvpNotes { get; set; }

        [DynamoDBProperty(typeof(EnumToStringConverter<SleepPreferenceEnum>))]
        public SleepPreferenceEnum? SleepPreference { get; set; }

        [DynamoDBProperty(typeof(EnumToStringConverter<RsvpEnum>))]
        public RsvpEnum? RsvpRehearsalDinner { get; set; }

        [DynamoDBProperty(typeof(EnumToStringConverter<RsvpEnum>))]
        public RsvpEnum? RsvpFourthOfJuly { get; set; }

        [DynamoDBProperty(typeof(EnumToStringConverter<RsvpEnum>))]
        public RsvpEnum? RsvpBuildWeek { get; set; }

        [DynamoDBProperty]
        public DateTime? ArrivalDate { get; set; }
        #endregion

        #region Preferences-specific fields
        /// <summary>
        /// RSVP-specific fields (used when SortKey = "PREFS")
        /// </summary>
        [DynamoDBProperty(typeof(EnumToStringConverter<MealPreferenceEnum>))]
        public MealPreferenceEnum? PrefMeal { get; set; }

        [DynamoDBProperty]
        public bool? PrefKidsPortion { get; set; }

        [DynamoDBProperty]
        public string? PrefFoodAllergies { get; set; }

        [DynamoDBProperty]
        public string? PrefSpecialAlcoholRequests { get; set; }
        #endregion
    }

}
