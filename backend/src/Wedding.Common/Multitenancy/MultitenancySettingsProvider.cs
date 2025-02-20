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
            switch (origin.ToLower())
            {
                // Unit tests only
                case ("https://api.christephanie.com"):
                    audience = $"https://api.christephanie.com";
                    break;
                case ("https://www.wedding.christephanie.com"):
                case ("https://fianceapi.wedding.christephanie.com"):
                case ("fianceapi.wedding.christephanie.com"):
                    audience = $"https://fianceapi.wedding.christephanie.com";
                    break;
                case ("https://www.dev.wedding.christephanie.com"):
                case ("https://fianceapi.dev.wedding.christephanie.com"):
                case ("fianceapi.dev.wedding.christephanie.com"):
                case ("http://localhost:5173"):
                case ("localhost:5173"):
                case ("http://localhost:5000"):
                case ("localhost:5000"):
                    audience = $"https://fianceapi.dev.wedding.christephanie.com";
                    break;
                default:
                    throw new Exception("Invalid audience.");
            }
            return audience;
        }

        public string GetMappedTableName(string tenantId, bool rateLimit = false)
        {
            string? databaseTable;
            switch (tenantId.ToLower())
            {
                // Unit tests only
                case ("https://api.christephanie.com"):
                    if (rateLimit)
                    {
                        databaseTable = $"christephanie-wedding-unittests-rate-limit";
                    }
                    else
                    {
                        databaseTable = $"christephanie-wedding-unittests";
                    }

                    break;
                case ("https://www.wedding.christephanie.com"):
                case ("https://fianceapi.wedding.christephanie.com"):
                case ("fianceapi.wedding.christephanie.com"):
                    if (rateLimit)
                    {
                        databaseTable = $"christephanie-wedding-rate-limit";
                    }
                    else
                    {
                        databaseTable = $"christephanie-wedding-guests-prod";
                    }

                    break;
                case ("https://www.dev.wedding.christephanie.com"):
                case ("https://fianceapi.dev.wedding.christephanie.com"):
                case ("fianceapi.dev.wedding.christephanie.com"):
                case ("http://localhost:5173"):
                case ("localhost:5173"):
                case ("http://localhost:5000"):
                case ("localhost:5000"):
                    if (rateLimit)
                    {
                        databaseTable = $"christephanie-wedding-rate-limit";
                    }
                    else
                    {
                        databaseTable = $"christephanie-wedding-guests-dev";
                    }
                    break;
                default:
                    throw new Exception($"Database tenant not found. {tenantId.ToLower()}");
            }
            return databaseTable;
        }
    }
}
