using System.Text.Json;
using System.Text.Json.Serialization;
using Wedding.Common.Serialization;

namespace Wedding.Common.Helpers.AWS.Frontend
{
    public class FrontendApiData
    {

        [JsonPropertyName("data")]
        public JsonElement? Data { get; set; }

        [JsonPropertyName("error")]
        public FrontendApiError? Error { get; set; }

        public FrontendApiData(object? data = null, FrontendApiError? error = null)
        {
            if (data != null)
            {
                Data = JsonSerializer.SerializeToElement(data, JsonSerializationHelper.CamelCaseJsonSerializerOptions);
            }

            if (error != null)
            {
                Error = error;
            }
        }
    }
}