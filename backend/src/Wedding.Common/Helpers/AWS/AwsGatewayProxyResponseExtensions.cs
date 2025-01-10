using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using System;
using Wedding.Common.Helpers.AWS.Frontend;
using System.Collections.Generic;
using System.Net;

namespace Wedding.Common.Helpers.AWS
{
    public static class AwsGatewayProxyResponseExtensions
    {
        public static T GetResponseBodyData<T>(this APIGatewayProxyResponse response)
        {
            return JsonSerializer.Deserialize<T>(response.Body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                   ?? throw new InvalidOperationException("Deserialization returned null.");
        }

        public static FrontendApiError GetResponseBodyError(this APIGatewayProxyResponse response)
        {
            return JsonSerializer.Deserialize<FrontendApiError>(response.Body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                   ?? throw new InvalidOperationException("Deserialization returned null.");
        }

        public static APIGatewayProxyResponse OkResponse<T>(this T data)
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.OK,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = data.ToFrontendResponseBody()
            };
        }

        public static APIGatewayProxyResponse ErrorResponse(this string errorDescription, int errorStatusCode, string errorType, Dictionary<string, string>? meta = null)
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = errorStatusCode,
                IsBase64Encoded = false,
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                Body = new FrontendApiError
                {
                    Status = errorStatusCode,
                    Error = errorType,
                    Description = errorDescription,
                    Meta = meta
                }.ToFrontendResponseBody(),
            };
        }
    }
}
