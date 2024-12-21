using System;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;

namespace Wedding.Common.Utility.Testing.TestChain
{
    public static class APIGatewayProxyResponseHelper
    {
        public static T GetResponseBody<T>(APIGatewayProxyResponse response)
        {
            return JsonSerializer.Deserialize<T>(response.Body) 
                   ?? throw new InvalidOperationException();
        }
    }
}
