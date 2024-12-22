using Amazon.Lambda.APIGatewayEvents;
using System;
using System.Collections.Generic;

namespace Wedding.Lambdas.Authorize.Helpers
{
    public static class GetRsvpCodeFromRequestHelper
    {
        public static string? GetInvitationCode(this APIGatewayCustomAuthorizerRequest request)
        {
            string invitationCode = null;
            var caseInsensitiveQueryParameters = new Dictionary<string, string>(request.QueryStringParameters, StringComparer.OrdinalIgnoreCase);
            var caseInsensitivePathParameters = new Dictionary<string, string>(request.PathParameters, StringComparer.OrdinalIgnoreCase);
            //var caseInsensitiveBodyParameters = new Dictionary<string, string>(request., StringComparer.OrdinalIgnoreCase);

            if (caseInsensitiveQueryParameters.TryGetValue("invitationCode", out var queryCode) && !string.IsNullOrEmpty(queryCode))
            {
                invitationCode = queryCode;
            }
            if (caseInsensitivePathParameters.TryGetValue("invitationCode", out var pathCode) && !string.IsNullOrEmpty(pathCode))
            {
                invitationCode = pathCode;
            }

            return invitationCode;
        }
    }
}
