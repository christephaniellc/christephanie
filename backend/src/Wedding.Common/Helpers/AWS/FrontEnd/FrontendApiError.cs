using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Wedding.Common.Helpers.AWS.Frontend
{
    public class FrontendApiError
    {
        /// <summary>
        /// Status Code
        /// </summary>
        [JsonPropertyName("status")]
        public int Status;

        /// <summary>
        /// Exception type
        /// </summary>
        [JsonPropertyName("error")]
        public string Error;

        /// <summary>
        /// Error string (user-facing)
        /// </summary>
        [JsonPropertyName("description")]
        public string Description;

        /// <summary>
        /// 
        /// </summary>
        [JsonPropertyName("meta")]
        public Dictionary<string, string>? Meta;
    }
}
