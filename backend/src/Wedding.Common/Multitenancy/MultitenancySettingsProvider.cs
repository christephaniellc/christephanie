using System;

namespace Wedding.Common.Multitenancy
{
    public class MultitenancySettingsProvider : IMultitenancySettingsProvider
    {
        public MultitenancySettingsProvider()
        {
        }

        public string GetMappedAudience(string origin)
        {
            string? audience;
            switch (origin)
            {
                // Unit tests only
                case ("https://api.christephanie.com"):
                    audience = $"https://api.christephanie.com";
                    break;
                case ("https://www.christephanie.com"):
                case ("https://wedding.christephanie.com/api"):
                case ("http://localhost:5173"):
                case ("localhost:5173"):
                case ("http://localhost:5000"):
                case ("localhost:5000"):
                    audience = $"https://wedding.christephanie.com/api";
                    break;
                default:
                    throw new Exception("Invalid audience.");
            }
            return audience;
        }

        public string GetMappedTableName(string tenantId)
        {
            string? databaseTable;
            switch (tenantId)
            {
                // Unit tests only
                case ("https://api.christephanie.com"):
                    databaseTable = $"christephanie-wedding-unittests";
                    break;
                case ("https://www.christephanie.com"):
                case ("https://wedding.christephanie.com/api"):
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
