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
            if (request.Headers.TryGetValue("Host", out var host)) return host.ToLower();
            if (request.Headers.TryGetValue("host", out var hostLower)) return hostLower.ToLower();
            if (request.Headers.TryGetValue("Origin", out var origin)) return origin.ToLower();
            if (request.Headers.TryGetValue("origin", out var originLower)) return originLower.ToLower();
            return null;
        }

        public static AuthContext GetAuthContext(this APIGatewayProxyRequest request)
        {
            // If the request context is null (e.g., when called from email verification link),
            // create a minimal auth context
            if (request.RequestContext == null || request.RequestContext.Authorizer == null)
            {
                Console.WriteLine("Creating empty auth context (no request context or authorizer)");
                return new AuthContext
                {
                    Audience = string.Empty,
                    InvitationCode = string.Empty,
                    GuestId = string.Empty,
                    Name = string.Empty,
                    Roles = string.Empty,
                    IpAddress = string.Empty
                };
            }
            
            return new AuthContext
            {
                Audience = request.GetAudienceFromAuthContext() ?? string.Empty,
                InvitationCode = request.GetInvitationCodeFromAuthContext() ?? string.Empty,
                GuestId = request.GetGuestIdFromAuthContext() ?? string.Empty,
                Name = request.GetNameFromAuthContext() ?? string.Empty,
                Roles = request.GetRoleStringFromAuthContext() ?? string.Empty,
                IpAddress = request.GetIpAddressFromAuthContext() ?? string.Empty
            };
        }

        public static string? GetCaseInsensitiveParam(APIGatewayProxyRequest request, string paramName)
        {
            string? paramValue = null;

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
                // Safely access request context - return null if any part is null
                if (request.RequestContext == null)
                {
                    Console.WriteLine("RequestContext is null");
                    return null;
                }
                
                var authorizerContext = request.RequestContext.Authorizer;
                if (authorizerContext == null)
                {
                    Console.WriteLine("Authorizer context is null");
                    return null;
                }
                
                Console.WriteLine($"authorizerContext: {JsonSerializer.Serialize(authorizerContext)}");

                if (authorizerContext.TryGetValue("lambda", out var lambdaContext))
                {
                    Console.WriteLine($"lambdaContext: {JsonSerializer.Serialize(lambdaContext)}");

                    var context = ParseAuthContext(lambdaContext?.ToString() ?? null);
                    if (context == null)
                    {
                        return null;
                    }

                    return key switch
                    {
                        "audience" => context.Audience,
                        "guestId" => context.GuestId,
                        "invitationCode" => context.InvitationCode,
                        "name" => context.Name,
                        "roles" => context.Roles,
                        "ipAddress" => context.IpAddress,
                        _ => null // Return null if key does not match any property
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in RequestLambdaData: {ex.ToString()}");
                // Return null instead of throwing an exception - this is safer for the token verification flow
                return null;
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

        public static string? GetNameFromAuthContext(this APIGatewayProxyRequest request)
        {
            return request.RequestLambdaData("name");
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
        public static string? GetIpAddressFromAuthContext(this APIGatewayProxyRequest request)
        {
            return request.RequestLambdaData("ipAddress");
        }

        public static string? GetInvitationCodeFromParams(this APIGatewayProxyRequest request)
        {
            return GetCaseInsensitiveParam(request, "invitationCode");
        }

        public static string? GetFirstNameFromParams(this APIGatewayProxyRequest request)
        {
            return GetCaseInsensitiveParam(request, "firstName");
        }

        public static string? GetVerifyTokenFromParams(this APIGatewayProxyRequest request)
        {
            return GetCaseInsensitiveParam(request, "token");
        }

        public static AuthContext? ParseAuthContext(string? json)
        {
            if (json == null)
            {
                Console.WriteLine($"No AuthContext found.");
                return null;
            }
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
