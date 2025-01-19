using System;

namespace Wedding.Common.Multitenancy
{
    public class MultitenancySettingsProvider : IMultitenancySettingsProvider
    {
        public MultitenancySettingsProvider()
        {
        }

        public string GetAudience(string origin)
        {
            string? audience = null;
            switch (origin)
            {
                case ("https://api.christephanie.com"):
                case ("https://www.christephanie.com"):
                case ("http://localhost:5173"):
                case ("localhost:5173"):
                case ("http://localhost:5000"):
                case ("localhost:5000"):
                    audience = $"https://api.christephanie.com";
                    break;
                default:
                    throw new Exception("Invalid audience.");
            }
            return audience;
        }

        public string GetTableName(string tenantId)
        {
            string? databaseTable = null;
            switch (tenantId)
            {
                case ("https://api.christephanie.com"):
                case ("https://www.christephanie.com"):
                case ("http://localhost:5173"):
                case ("localhost:5173"):
                case ("http://localhost:5000"):
                case ("localhost:5000"):
                    databaseTable = $"christephanie-wedding";
                    break;
                default:
                    throw new Exception("Database tenant not found.");
            }
            return databaseTable;
        }
    }
}
