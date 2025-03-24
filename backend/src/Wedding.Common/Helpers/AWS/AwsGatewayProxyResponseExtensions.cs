using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using System;
using Wedding.Common.Helpers.AWS.Frontend;
using System.Collections.Generic;
using System.Net;
using Wedding.Common.Serialization;

namespace Wedding.Common.Helpers.AWS
{
    public static class AwsGatewayProxyResponseExtensions
    {
        public static T GetResponseBodyData<T>(this APIGatewayProxyResponse response)
        {
            return JsonSerializer.Deserialize<T>(response.Body, JsonSerializationHelper.CamelCaseJsonSerializerOptions)
                   ?? throw new InvalidOperationException("Deserialization returned null.");
        }

        public static FrontendApiError GetResponseBodyError(this APIGatewayProxyResponse response)
        {
            return JsonSerializer.Deserialize<FrontendApiError>(response.Body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                   ?? throw new InvalidOperationException("Deserialization returned null.");
        }

        public static Dictionary<string, string> GetCorsHeaders(string? origin)
        {
            // If no origin is provided, use wildcard
            string resolvedOrigin = origin ?? "*";
            
            // Create headers dictionary with CORS headers
            var headers = new Dictionary<string, string>
            {
                { "Content-Type", "application/json" },
                { "Access-Control-Allow-Origin", resolvedOrigin },
                { "Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With" },
                { "Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS" },
                { "Access-Control-Allow-Credentials", "true" }
            };
            
            return headers;
        }

        public static APIGatewayProxyResponse OkResponse<T>(this T data, string? origin = null)
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.OK,
                IsBase64Encoded = false,
                Headers = GetCorsHeaders(origin),
                Body = data.ToFrontendResponseBody()
            };
        }

        public static APIGatewayProxyResponse ErrorResponse(this string errorDescription, int errorStatusCode, string errorType, Dictionary<string, string>? meta = null, string? origin = null)
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = errorStatusCode,
                IsBase64Encoded = false,
                Headers = GetCorsHeaders(origin),
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
