namespace Wedding.Abstractions.Enums
{
    /// <summary>
    /// Dictates allowed events
    /// </summary>
    public enum RoleEnum
    {
        Guest,
        Party,
        FourthOfJuly,   // Campers 
        Rehearsal,      // Rehearsal dinner attendees
        Staff,          // Paid help: DJ, Fire spinners
        Manor,          // Residents of manor, invited to breakfasts
        Camper,         // Guests camping on the grounds
        BetaTester,     // Allows access to screen recordings
        Admin           // Can edit guests and family units
    }
}
