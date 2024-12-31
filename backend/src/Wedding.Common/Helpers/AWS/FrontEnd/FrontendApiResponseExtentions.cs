using System.Text.Json;

namespace Wedding.Common.Helpers.AWS.Frontend
{
    public static class FrontendApiResponseExtentions
    {
        public static readonly JsonSerializerOptions DefaultJsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
        };

        public static string ToBody(this FrontendApiResponse response)
        {
            return JsonSerializer.Serialize(response, DefaultJsonSerializerOptions);
        }
    }
}
