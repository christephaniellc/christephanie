namespace Wedding.Abstractions.Enums
{
    /// <summary>
    /// Dictates allowed events
    /// </summary>
    public enum RoleEnum
    {
        None = 0,
        Party = 1,
        Rehearsal = 2,      // Rehearsal dinner attendees
        Builder = 3,        // Unpaid help
        Staff = 4,          // Paid help: DJ, Fire spinners
        Admin = 5,          // Can edit guests and family units
    }
}
