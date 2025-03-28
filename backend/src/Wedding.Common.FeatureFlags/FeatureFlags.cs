using System.Collections.Generic;

namespace Wedding.Common.FeatureFlags
{
    public static class FeatureFlags
    {
        public static List<string> TiersToIncludeInStats = new List<string>() { "Platinum+", "Platinum", "Gold", "Sapphire", "Ruby" };

        public static bool RsvpStageEnabled = false;

        public static bool WeddingStageEnabled = false;
    }
}
