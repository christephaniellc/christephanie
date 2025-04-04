using System.Collections.Generic;

namespace Wedding.Abstractions.ViewModels
{
    public class StatsViewModel
    {
        public int TotalGuests { get; set; } = 0;
        public int TotalRespondedSurveyGuests { get; set; } = 0;
        public int TotalRespondedRsvpGuests { get; set; } = 0;
        public int AttendingWeddingGuests { get; set; } = 0;
        public int Attending4thGuests { get; set; } = 0;
        public int InterestedGuests { get; set; } = 0;
        public int DeclinedGuests { get; set; } = 0;
        public int PendingWeddingGuests { get; set; } = 0;
        public int Pending4thGuests { get; set; } = 0;
        public int Declined4thGuests { get; set; } = 0;

        public int BabyGuests { get; set; } = 0;
        public int Under13Guests { get; set; } = 0;
        public int Under21Guests { get; set; } = 0;
        public int AdultGuests { get; set; } = 0;

        public int OmnivoreGuests { get; set; } = 0;
        public int VegetarianGuests { get; set; } = 0;
        public int VeganGuests { get; set; } = 0;

        public Dictionary<string, int> AllergiesCount { get; set; } = new Dictionary<string, int>();

        public int ManorGuests { get; set; } = 0;
        public int CampingGuests { get; set; } = 0;
        public int HotelGuests { get; set; } = 0;
        public int OtherAccommodationGuests { get; set; } = 0;
        public int UnknownAccommodationGuests { get; set; } = 0;

        public int InterestedFamilies { get; set; } = 0;
        public int AttendingWeddingFamilies { get; set; } = 0;
        public int Attending4thFamilies { get; set; } = 0;
        public int DeclinedFamilies { get; set; } = 0;
        public int PendingFamilies { get; set; } = 0;
        public int TotalFamilies { get; set; } = 0;

        public int TotalClientInfos { get; set; } = 0;
        public Dictionary<string, int> DeviceTypesCount { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> Browsers { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> OperatingSystems { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> ScreenSizes { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> Languages { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> ConnectionTypes { get; set; } = new Dictionary<string, int>();
        public List<string> DeviceIds { get; set; } = new List<string>();
    }
}
