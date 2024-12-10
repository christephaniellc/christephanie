using System.Collections.Generic;

namespace Wedding.Common.Configuration
{
    public class ConnectionStringsOptions
    {
        /// <summary>
        /// ConnectionStrings keyword.
        /// </summary>
        public const string ConnectionStrings = "ConnectionStrings";

        /// <summary>
        /// Storage Account values.
        /// </summary>
        public Dictionary<string, string> StorageAccount { get; set; } = new();
    }
}
