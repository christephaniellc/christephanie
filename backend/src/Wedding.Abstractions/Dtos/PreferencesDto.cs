using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class PreferencesDto
    {
        public SleepPreferenceEnum? SleepPreference { get; set; }

        public FoodPreferenceEnum? FoodPreference { get; set; }

        public string? FoodAllergies { get; set; }
    }
}
