using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using System;
using Wedding.Common.Helpers.AWS.Frontend;

namespace Wedding.Common.Helpers.AWS
{
    public static class AwsGatewayProxyResponseExtensions
    {
        public static T GetResponseBody<T>(this APIGatewayProxyResponse response)
        {
            var body = JsonSerializer.Deserialize<FrontendApiData>(response.Body);

            if (body?.Data is not JsonElement data || data.ValueKind != JsonValueKind.Object)
            {
                throw new InvalidOperationException("Response body data is not a valid JSON object.");
            }

            return data.Deserialize<T>(new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                   ?? throw new InvalidOperationException("Deserialization returned null.");
        }
    }
}
