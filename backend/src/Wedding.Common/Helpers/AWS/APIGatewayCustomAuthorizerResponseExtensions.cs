using System;
using System.Collections.Generic;
using System.Linq;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Abstractions.Dtos.Auth0;
using Wedding.Abstractions.Enums;

namespace Wedding.Common.Helpers.AWS
{
    public static class APIGatewayCustomAuthorizerResponseExtensions
    {
        public static APIGatewayCustomAuthorizerResponse GeneratePolicy(PolicyEffectEnum effect,
            string methodArn,
            string token = null,
            Auth0User? authenticatedUser = null,
            string? error = null)
        {
            var context = new APIGatewayCustomAuthorizerContextOutput();

            context["token"] = token;
            context["guestId"] = authenticatedUser?.GuestId ?? null;
            context["roles"] = string.Join(",", (authenticatedUser?.Roles.Select(role => role.ToString())) ?? null);
            context["invitationCode"] = authenticatedUser?.InvitationCode ?? null;

            if (error != null)
            {
                context["error"] = error;
            }

            return new APIGatewayCustomAuthorizerResponse
            {
                PrincipalID = authenticatedUser?.GuestId ?? "unknown",
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

        public static string? GetGuestId(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["principalId"]?.ToString();
        }

        public static string? GetInvitationCode(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["invitationCode"]?.ToString();
        }

        public static string? GetToken(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["token"]?.ToString();
        }

        public static List<RoleEnum>? GetRoles(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["roles"]?.ToString()
                .Split(',').Select(roles => Enum.Parse<RoleEnum>(roles)).ToList(); // comma delimited string of roles
        }
    }
}
