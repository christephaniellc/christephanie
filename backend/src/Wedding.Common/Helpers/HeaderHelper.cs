using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace Wedding.Common.Helpers
{
    public static class HeaderHelper
    {
        public static Dictionary<string, string>? GetHeaders(IHeaderDictionary headerDictionary)
        {
            return headerDictionary
                .ToDictionary(header => header.Key, header => header.Value.ToString());
        }

        public static string GetToken(IHeaderDictionary headerDictionary)
        {
            var headers = GetHeaders(headerDictionary);
            return headers!["Authorization"].Replace("Bearer ", "");
        }
        public static string? GetIpAddress(HttpContext httpContext)
        {
            return httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                   ?? httpContext.Request.Headers["X-Real-IP"].FirstOrDefault()
                   ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? null;
        }
    }
}
