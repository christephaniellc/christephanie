using System;
using System.Collections.Generic;
using System.Linq;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Abstractions.Enums;

namespace Wedding.Common.Helpers.AWS
{
    public static class APIGatewayCustomAuthorizerRequestExtensions
    {
        public static string? GetCaseInsensitiveParam(APIGatewayCustomAuthorizerRequest request, string paramName)
        {
            string paramValue = null;

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
            return request.RequestContext.Authorizer["roles"]?.ToString()
                .Split(',').Select(roles => Enum.Parse<RoleEnum>(roles)).ToList(); // comma delimited string of roles
        }
    }
}
