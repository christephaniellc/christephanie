namespace Wedding.Abstractions.Enums
{
    /// <summary>
    /// Dictates allowed events
    /// </summary>
    public enum RoleEnum
    {
        Guest,
        Party,
        Rehearsal,      // Rehearsal dinner attendees
        Builder,        // Unpaid help
        Staff,          // Paid help: DJ, Fire spinners
        Admin,          // Can edit guests and family units
    }
}
