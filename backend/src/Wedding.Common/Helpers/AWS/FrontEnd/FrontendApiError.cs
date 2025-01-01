using System;
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
        public int Status { get; set; }

        /// <summary>
        /// Exception type
        /// </summary>
        [JsonPropertyName("error")]
        public string Error { get; set; }

        /// <summary>
        /// Error string (user-facing)
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [JsonPropertyName("meta")]
        public Dictionary<string, string>? Meta { get; set; }
    }
}
