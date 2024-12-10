using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Dtos
{
    public class PreferencesDto
    {
        public string GuestId { get; set; } = "";

        public MealPreferenceEnum Meal { get; set; }

        public bool KidsPortion { get; set; }

        public string? FoodAllergies { get; set; }

        public string? SpecialAlcoholRequests { get; set; }
    }
}
