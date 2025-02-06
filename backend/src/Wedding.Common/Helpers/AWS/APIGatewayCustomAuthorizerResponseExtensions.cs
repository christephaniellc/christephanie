using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;

namespace Wedding.Common.Helpers.AWS
{
    public static class APIGatewayCustomAuthorizerResponseExtensions
    {
        public static APIGatewayCustomAuthorizerResponse GeneratePolicy(PolicyEffectEnum effect,
            string methodArn,
            string audience = null,
            string token = null,
            string ipAddress = null,
            GuestDto? authenticatedUser = null,
            string? error = null)
        {
            var context = new APIGatewayCustomAuthorizerContextOutput();

            if (error != null)
            {
                context["error"] = error;
            }
            else
            {

                context["token"] = token;
                context["audience"] = audience ?? null;
                context["guestId"] = authenticatedUser?.GuestId ?? null;
                context["name"] = authenticatedUser?.FirstName + " " + authenticatedUser?.LastName;
                context["roles"] = string.Join(",", (authenticatedUser?.Roles.Select(role => role.ToString())) ?? null);
                context["invitationCode"] = authenticatedUser?.InvitationCode ?? null;
                context["ipAddress"] = ipAddress;
            }

            return new APIGatewayCustomAuthorizerResponse
            {
                PrincipalID = authenticatedUser?.Auth0Id ?? authenticatedUser?.GuestId ?? "unknown",
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

        public static APIGatewayCustomAuthorizerContext ConvertToCustomAuthorizerContext(this 
            APIGatewayCustomAuthorizerContextOutput output)
        {
            if (output == null) 
                throw new ArgumentNullException(nameof(output));

            var wrappedContextJson = JsonSerializer.Serialize(new { lambda = output });
            var wrappedContext = JsonSerializer.Deserialize<Dictionary<string, APIGatewayCustomAuthorizerContext>>(wrappedContextJson);
            if (wrappedContext == null || !wrappedContext.TryGetValue("lambda", out var lambda))
            {
                throw new InvalidOperationException("Failed to convert context.");
            }

            var context = JsonSerializer.Deserialize<APIGatewayCustomAuthorizerContext>(wrappedContextJson);

            return context;
        }

        public static string? GetGuestIdFromAuth(this APIGatewayCustomAuthorizerResponse response)
        {
            //return response.Context["principalId"]?.ToString();
            return response.Context["guestId"]?.ToString();
        }

        public static string? GetNameFromAuth(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["name"]?.ToString();
        }

        public static string? GetAudienceFromAuth(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["audience"]?.ToString();
        }

        public static string? GetInvitationCodeFromAuth(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["invitationCode"]?.ToString();
        }

        public static string? GetTokenFromAuth(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["token"]?.ToString();
        }

        public static List<RoleEnum>? GetRolesFromAuth(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["roles"]?.ToString()
                .Split(',').Select(roles => Enum.Parse<RoleEnum>(roles)).ToList(); // comma delimited string of roles
        }

        public static string? GetIpAddressFromAuth(this APIGatewayCustomAuthorizerResponse response)
        {
            return response.Context["ipAddress"]?.ToString();
        }
    }
}
