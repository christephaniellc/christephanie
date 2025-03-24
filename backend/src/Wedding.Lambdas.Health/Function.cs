using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace Wedding.Lambdas.Health
{
    public class Function
    {
        /// <summary>
        /// A simple health check endpoint that returns a 200 OK response
        /// with appropriate CORS headers for debugging purposes.
        /// </summary>
        /// <param name="request">The API Gateway proxy request</param>
        /// <param name="context">The Lambda execution context</param>
        /// <returns>The API Gateway proxy response</returns>
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            // Log the request for debugging
            context.Logger.LogLine($"Health check requested - Method: {request.HttpMethod}, Path: {request.Path}");
            
            // Log headers for debugging
            if (request.Headers != null)
            {
                foreach (var header in request.Headers)
                {
                    context.Logger.LogLine($"Header: {header.Key} = {header.Value}");
                }
            }

            // Get the origin from the request headers
            string origin = "*"; // Default fallback
            if (request.Headers != null && request.Headers.TryGetValue("Origin", out string originHeader))
            {
                origin = originHeader;
                context.Logger.LogLine($"Using specific origin: {origin}");
            }

            // Set up CORS headers
            var headers = new Dictionary<string, string>
            {
                { "Access-Control-Allow-Origin", origin },
                { "Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With" },
                { "Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS" },
                { "Access-Control-Allow-Credentials", "true" },
                { "Access-Control-Max-Age", "86400" } // Cache preflight request for 24 hours
            };

            // Handle OPTIONS method for CORS preflight requests
            if (request.HttpMethod?.ToUpper() == "OPTIONS")
            {
                context.Logger.LogLine("Handling OPTIONS preflight request");
                
                // Return a 204 No Content response with CORS headers for preflight requests
                return new APIGatewayProxyResponse
                {
                    StatusCode = 204, // No Content is standard for OPTIONS
                    Headers = headers,
                    Body = string.Empty,
                    IsBase64Encoded = false
                };
            }

            // For GET requests, include the health check body
            var responseBody = new Dictionary<string, object>
            {
                { "status", "healthy" },
                { "message", "API is operational" },
                { "environment", System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "unknown" },
                { "timestamp", System.DateTimeOffset.UtcNow.ToString("o") },
                { "cors", new Dictionary<string, string> {
                    { "origin", origin },
                    { "allowCredentials", "true" }
                }}
            };

            // JSON serialize the response body
            string serializedBody = JsonSerializer.Serialize(responseBody);

            // Add content type for GET responses
            headers.Add("Content-Type", "application/json");

            // Return the response with CORS headers
            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Body = serializedBody,
                Headers = headers,
                IsBase64Encoded = false
            };
        }
    }
}