using System;
using System.Collections.Generic;
using System.Linq;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Abstractions.Enums;

namespace Wedding.Common.Helpers.AWS
{
    public static class APIGatewayCustomAuthorizerRequestExtensions
    {
        public static string? GetOriginFromRequest(this APIGatewayCustomAuthorizerRequest request)
        {
            if (request.Headers == null) return null;
            if (request.Headers.ContainsKey("Origin")) return request.Headers["Origin"].ToLower();
            if (request.Headers.ContainsKey("origin")) return request.Headers["origin"].ToLower();
            if (request.Headers.ContainsKey("Host")) return request.Headers["Host"].ToLower();
            if (request.Headers.ContainsKey("host")) return request.Headers["host"].ToLower();
            return null;
        }

        public static string GetIpAddressFromRequest(this APIGatewayCustomAuthorizerRequest request)
        {
            var ipAddress = request?.RequestContext?.Identity?.SourceIp ?? null;

            if (string.IsNullOrEmpty(ipAddress) && request?.Headers != null)
            {
                var forwardedForHeader = request.Headers
                    .FirstOrDefault(h => string.Equals(h.Key, "X-Forwarded-For", StringComparison.OrdinalIgnoreCase))
                    .Value;

                if (!string.IsNullOrEmpty(forwardedForHeader))
                {
                    ipAddress = forwardedForHeader.Split(',')[0].Trim();
                }
            }

            return ipAddress ?? String.Empty;
        }

        public static string? GetCaseInsensitiveParam(APIGatewayCustomAuthorizerRequest request, string paramName)
        {
            string? paramValue = null;

            var caseInsensitiveHeaderParameters = new Dictionary<string, string>(request.Headers, StringComparer.OrdinalIgnoreCase);
            var caseInsensitiveQueryParameters = new Dictionary<string, string>(request.QueryStringParameters, StringComparer.OrdinalIgnoreCase);
            var caseInsensitivePathParameters = new Dictionary<string, string>(request.PathParameters, StringComparer.OrdinalIgnoreCase);

            if (caseInsensitiveHeaderParameters.TryGetValue(paramName, out var headerCode) && !string.IsNullOrEmpty(headerCode))
            {
                paramValue = headerCode;
            }
            if (caseInsensitiveQueryParameters.TryGetValue(paramName, out var queryCode) && !string.IsNullOrEmpty(queryCode))
            {
                paramValue = queryCode;
            }
            if (caseInsensitivePathParameters.TryGetValue(paramName, out var pathCode) && !string.IsNullOrEmpty(pathCode))
            {
                paramValue = pathCode;
            }

            return paramValue;
        }

        public static string? GetInvitationCode(this APIGatewayCustomAuthorizerRequest request)
        {
            return GetCaseInsensitiveParam(request, "invitationCode");
        }

        public static string? GetFirstName(this APIGatewayCustomAuthorizerRequest request)
        {
            return GetCaseInsensitiveParam(request, "firstName");
        }

        public static string GetRequestSourceIp(this APIGatewayCustomAuthorizerRequest request)
        {
            return request.RequestContext.Identity.SourceIp;
        }

        public static string? GetUserId(this APIGatewayCustomAuthorizerRequest request)
        {
            return request.RequestContext.Authorizer["principalId"]?.ToString();
        }

        public static string? GetToken(this APIGatewayCustomAuthorizerRequest request)
        {
            return request.RequestContext.Authorizer["token"]?.ToString();
        }

        public static List<RoleEnum>? GetRoles(this APIGatewayCustomAuthorizerRequest request)
        {
            return request.RequestContext.Authorizer["roles"]?.ToString()?
                .Split(',').Select(roles => Enum.Parse<RoleEnum>(roles)).ToList() ?? null; // comma delimited string of roles
        }
    }
}
