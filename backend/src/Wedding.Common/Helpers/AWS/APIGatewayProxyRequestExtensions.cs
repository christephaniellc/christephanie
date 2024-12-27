using System;
using Amazon.Lambda.APIGatewayEvents;
using System.Collections.Generic;
using System.Linq;
using Wedding.Abstractions.Enums;

namespace Wedding.Common.Helpers.AWS
{
    public static class APIGatewayProxyRequestExtensions
    {
        public static string? GetCaseInsensitiveParam(APIGatewayProxyRequest request, string paramName)
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

        public static string? GetGuestId(this APIGatewayProxyRequest request)
        {
            return request.RequestContext.Authorizer["principalId"]?.ToString();
        }

        public static string? GetInvitationCode(this APIGatewayProxyRequest request)
        {
            return request.RequestContext.Authorizer["invitationCode"]?.ToString();
        }

        public static string? GetFirstName(this APIGatewayProxyRequest request)
        {
            return GetCaseInsensitiveParam(request, "firstName");
        }

        public static string? GetToken(this APIGatewayProxyRequest request)
        {
            return request.RequestContext.Authorizer["token"]?.ToString();
        }

        public static List<RoleEnum>? GetRoles(this APIGatewayProxyRequest request)
        {
            return request.RequestContext.Authorizer["roles"]?
                .ToString()
                .Split(',')
                .Select(roles => Enum.Parse<RoleEnum>(roles))
                .ToList(); // comma delimited string of roles
        }
    }
}
