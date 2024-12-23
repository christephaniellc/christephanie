using Amazon.Lambda.APIGatewayEvents;
using System;
using System.Collections.Generic;

namespace Wedding.Lambdas.Authorize.Helpers
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
    }
}
