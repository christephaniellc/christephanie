using System;
using System.Collections.Generic;
using System.Linq;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Abstractions.Dtos.Auth0;
using Wedding.Abstractions.Enums;

namespace Wedding.Common.Helpers.AWS
{
    public static class APIGatewayCustomAuthorizerResponseHelper
    {
        public static APIGatewayCustomAuthorizerResponse GeneratePolicy(PolicyEffectEnum effect,
            string methodArn,
            string token = null,
            Auth0User? authenticatedUser = null,
            string? error = null)
        {
            var context = new APIGatewayCustomAuthorizerContextOutput();

            context["token"] = token;
            context["roles"] = string.Join(",", (authenticatedUser?.Roles.Select(role => role.ToString())) ?? null);
            context["invitationCode"] = authenticatedUser?.InvitationCode ?? null;

            if (error != null)
            {
                context["error"] = error;
            }

            return new APIGatewayCustomAuthorizerResponse
            {
                PrincipalID = authenticatedUser.UserId ?? "unknown",
                PolicyDocument = new APIGatewayCustomAuthorizerPolicy
                {
                    Version = "2012-10-17",
                    Statement = new List<APIGatewayCustomAuthorizerPolicy.IAMPolicyStatement>
                    {
                        new APIGatewayCustomAuthorizerPolicy.IAMPolicyStatement
                        {
                            Action = new HashSet<string> { "execute-api:Invoke" },
                            Effect = effect.ToString(),
                            Resource = new HashSet<string> { methodArn }
                        }
                    }
                },
                Context = context
            };
        }
    }
}
