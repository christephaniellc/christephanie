using System.Text.Json;
using System.Text.Json.Serialization;

namespace Wedding.Common.Helpers.AWS.Frontend
{
    public class FrontendApiResponse
    {

        [JsonPropertyName("data")]
        public JsonElement? Data { get; set; }

        [JsonPropertyName("error")]
        public FrontendApiError? Error { get; set; }
    }
}