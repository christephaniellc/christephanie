using Amazon.DynamoDBv2.DataModel;
using System.Collections.Generic;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;

namespace Wedding.Abstractions.Dtos
{
    public class PreferencesDto
    {
        [DynamoDBProperty(typeof(EnumToStringConverter<NotificationPreferenceEnum>))]
        public List<NotificationPreferenceEnum>? NotificationPreference { get; set; }

        [DynamoDBProperty(typeof(EnumToStringConverter<SleepPreferenceEnum>))]
        public SleepPreferenceEnum? SleepPreference { get; set; }

        [DynamoDBProperty(typeof(EnumToStringConverter<FoodPreferenceEnum>))]
        public FoodPreferenceEnum? FoodPreference { get; set; }

        public List<string>? FoodAllergies { get; set; }
    }
}
