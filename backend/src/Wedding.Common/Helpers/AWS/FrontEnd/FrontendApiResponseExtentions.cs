using System.Text.Json;
using Wedding.Common.Serialization;

namespace Wedding.Common.Helpers.AWS.Frontend
{
    public static class FrontendApiResponseExtentions
    {
        public static string ToBody(this FrontendApiData data)
        {
            return JsonSerializer.Serialize(data, JsonSerializationHelper.CamelCaseJsonSerializerOptions);
        }
        public static string ToBody(this FrontendApiError error)
        {
            return JsonSerializer.Serialize(error, JsonSerializationHelper.CamelCaseJsonSerializerOptions);
        }
    }
}
