using System.Collections.Generic;
using Amazon.Lambda.APIGatewayEvents;

namespace Wedding.PublicApi.Logic.Services
{
    public class AuthResponse
    {
        public string? AuthToken { get; set; }
        public Dictionary<string, List<string>> Claims { get; set; }
        public APIGatewayProxyResponse Response { get; set; }
        public bool Authorized { get; set; } = false;
    }
}
