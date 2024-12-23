using System;
using Amazon.Lambda.APIGatewayEvents;
using System.Collections.Generic;
using System.Linq;
using Wedding.Abstractions.Enums;

namespace Wedding.Common.Helpers.AWS
{
    public static class APIGatewayProxyRequestExtensions
    {
        public static string? GetUserId(this APIGatewayProxyRequest request)
        {
            return request.RequestContext.Authorizer["principalId"]?.ToString();
        }

        public static string? GetInvitationCode(this APIGatewayProxyRequest request)
        {
            return request.RequestContext.Authorizer["invitationCode"]?.ToString();
        }

        public static string? GetToken(this APIGatewayProxyRequest request)
        {
            return request.RequestContext.Authorizer["token"]?.ToString();
        }

        public static List<RoleEnum>? GetRoles(this APIGatewayProxyRequest request)
        {
            return request.RequestContext.Authorizer["roles"]?.ToString()
                .Split(',').Select(roles => Enum.Parse<RoleEnum>(roles)).ToList(); // comma delimited string of roles
        }
    }
}
