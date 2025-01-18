using System;
using Amazon.Lambda.APIGatewayEvents;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Dtos.Auth;

namespace Wedding.Common.Helpers.AWS
{
    public static class APIGatewayProxyRequestExtensions
    {
        public static string? GetOriginFromRequest(this APIGatewayProxyRequest request)
        {
            if (request.Headers == null) return null;
            if (request.Headers.ContainsKey("Origin")) return request.Headers["Origin"].ToLower();
            if (request.Headers.ContainsKey("origin")) return request.Headers["origin"].ToLower();
            return null;
        }

        public static AuthContext GetAuthContext(this APIGatewayProxyRequest request)
        {
            return new AuthContext
            {
                Audience = request.GetAudienceFromAuthContext(),
                InvitationCode = request.GetInvitationCodeFromAuthContext(),
                GuestId = request.GetGuestIdFromAuthContext(),
                Roles = request.GetRoleStringFromAuthContext()
            };
        }

        public static string? GetCaseInsensitiveParam(APIGatewayProxyRequest request, string paramName)
        {
            string paramValue = null;

            var caseInsensitiveHeaderParameters = request.Headers != null ? new Dictionary<string, string>(request.Headers, StringComparer.OrdinalIgnoreCase) : null;
            var caseInsensitiveQueryParameters = request.QueryStringParameters != null ? new Dictionary<string, string>(request.QueryStringParameters, StringComparer.OrdinalIgnoreCase) : null;
            var caseInsensitivePathParameters = request.PathParameters != null ? new Dictionary<string, string>(request.PathParameters, StringComparer.OrdinalIgnoreCase) : null;

            if (caseInsensitiveHeaderParameters != null && caseInsensitiveHeaderParameters.TryGetValue(paramName, out var headerCode) && !string.IsNullOrEmpty(headerCode))
            {
                paramValue = headerCode;
            }
            if (caseInsensitiveQueryParameters != null && caseInsensitiveQueryParameters.TryGetValue(paramName, out var queryCode) && !string.IsNullOrEmpty(queryCode))
            {
                paramValue = queryCode;
            }
            if (caseInsensitivePathParameters != null && caseInsensitivePathParameters.TryGetValue(paramName, out var pathCode) && !string.IsNullOrEmpty(pathCode))
            {
                paramValue = pathCode;
            }

            return paramValue;
        }

        // public static string? GetUserId(this APIGatewayProxyRequest request)
        // {
        //     return request.RequestContext.Authorizer["principalId"]?.ToString();
        // }


        public static APIGatewayProxyRequest AddAuthToRequest(this APIGatewayProxyRequest request, APIGatewayCustomAuthorizerResponse authResponse)
        {
            request.RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
            {
                Authorizer = authResponse.Context.ConvertToCustomAuthorizerContext()
            };
            return request;
        }

        public static string? RequestLambdaData(this APIGatewayProxyRequest request, string key)
        {
            try
            {
                var authorizerContext = request.RequestContext.Authorizer;
                Console.WriteLine($"authorizerContext: {JsonSerializer.Serialize(authorizerContext)}");

                if (authorizerContext != null && authorizerContext.TryGetValue("lambda", out var lambdaContext))
                {
                    Console.WriteLine($"lambdaContext: {JsonSerializer.Serialize(lambdaContext)}");

                    var context = ParseAuthContext(lambdaContext.ToString());

                    return key switch
                    {
                        "audience" => context.Audience,
                        "guestId" => context.GuestId,
                        "invitationCode" => context.InvitationCode,
                        "roles" => context.Roles,
                        _ => null // Return null if key does not match any property
                    };
                }
            }
            catch (Exception ex)
            {
                throw new UnauthorizedAccessException("Unauthorized access exception.");
            }

            return null;
        }

        public static string? GetAudienceFromAuthContext(this APIGatewayProxyRequest request)
        {
            return request.RequestLambdaData("audience");
        }

        public static string? GetGuestIdFromAuthContext(this APIGatewayProxyRequest request)
        {
            return request.RequestLambdaData("guestId");
        }

        public static string? GetInvitationCodeFromAuthContext(this APIGatewayProxyRequest request)
        {
            return request.RequestLambdaData("invitationCode");
        }

        // public static string? GetTokenFromAuth(this APIGatewayProxyRequest request)
        // {
        //     return request.RequestContext.Authorizer["lambda:token"]?.ToString();
        // }

        public static List<RoleEnum>? GetRolesFromAuthContext(this APIGatewayProxyRequest request)
        {
            var roles = request.RequestLambdaData("roles");
            return roles?
                .ToString()
                .Split(',')
                .Select(roles => Enum.Parse<RoleEnum>(roles))
                .ToList(); // comma delimited string of roles
        }

        public static string? GetRoleStringFromAuthContext(this APIGatewayProxyRequest request)
        {
            var roles = request.RequestLambdaData("roles");
            return roles?
                .ToString(); // comma delimited string of roles
        }

        public static string? GetInvitationCodeFromParams(this APIGatewayProxyRequest request)
        {
            return GetCaseInsensitiveParam(request, "invitationCode");
        }

        public static string? GetFirstNameFromParams(this APIGatewayProxyRequest request)
        {
            return GetCaseInsensitiveParam(request, "firstName");
        }

        public static AuthContext? ParseAuthContext(string json)
        {
            try
            {
                return JsonSerializer.Deserialize<AuthContext>(json);
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"Failed to deserialize AuthContext: {ex.Message}");
                return null;
            }
        }
    }
}
