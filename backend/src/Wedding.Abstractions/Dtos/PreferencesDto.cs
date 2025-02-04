using System.Collections.Generic;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class PreferencesDto
    {
        public List<NotificationPreferenceEnum>? NotificationPreference { get; set; }

        public SleepPreferenceEnum? SleepPreference { get; set; }

        public FoodPreferenceEnum? FoodPreference { get; set; }

        public List<string>? FoodAllergies { get; set; }
    }
}
