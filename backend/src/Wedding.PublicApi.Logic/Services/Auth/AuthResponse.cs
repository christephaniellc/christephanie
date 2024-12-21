using System.Collections.Generic;
using System.Net;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public class AuthResponse
    {
        public string? AuthToken { get; set; }
        public Dictionary<string, List<string>> Claims { get; set; }
        public string? Identity { get; set; }
        public HttpStatusCode ResponseStatusCode { get; set; }
        public string ResponseMessage { get; set; }
        public bool Authorized { get; set; } = false;
    }
}
