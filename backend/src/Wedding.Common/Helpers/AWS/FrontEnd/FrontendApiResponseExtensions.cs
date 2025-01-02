using System.Text.Json;
using Wedding.Common.Serialization;

namespace Wedding.Common.Helpers.AWS.Frontend
{
    public static class FrontendApiResponseExtensions
    {
        public static string ToFrontendResponseBody<T>(this T body)
        {
            return JsonSerializer.Serialize(body, JsonSerializationHelper.CamelCaseJsonSerializerOptions);
        }
        // public static string ToFrontendResponseBody(this FrontendApiData data)
        // {
        //     return JsonSerializer.Serialize(data, JsonSerializationHelper.CamelCaseJsonSerializerOptions);
        // }
        // public static string ToFrontendResponseBody(this FrontendApiError error)
        // {
        //     return JsonSerializer.Serialize(error, JsonSerializationHelper.CamelCaseJsonSerializerOptions);
        // }
    }
}
