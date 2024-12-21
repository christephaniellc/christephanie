using Amazon.DynamoDBv2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Abstractions.Enums;
using Amazon.DynamoDBv2.Model;
using AutoMapper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Lambdas.Authorize.Enums;
using System.Text.RegularExpressions;
using System.Text.Json;
using System.Text;
using Wedding.Abstractions.Dtos.Auth0;
using Wedding.Common.ThirdParty;

namespace Wedding.Lambdas.Authorize.Providers
{
    public class Auth0Provider : IAuthorizationProvider
    {
        private readonly string _authority;
        private readonly string _audience;
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly IMapper _mapper;
        private readonly string _dynamoTableName;
        private readonly string _dynamoTableIdentityCol;
        private readonly string _dynamoTableIdentityIndex;
        
        public Auth0Provider(string authority, 
            string audience, 
            string clientId, 
            string clientSecret,
            IMapper mapper,
            string dynamoTableName,
            string dynamoTableIdentityCol, 
            string dynamoTableIdentityIndex)
        {
            _authority = authority;
            _audience = audience;
            _clientId = clientId;
            _clientSecret = clientSecret;
            _mapper = mapper;
            _dynamoTableName = dynamoTableName;
            _dynamoTableIdentityCol = dynamoTableIdentityCol;
            _dynamoTableIdentityIndex = dynamoTableIdentityIndex;
        }

        private async Task<string?> GetAccessToken()
        {
            var tokenEndpoint = $"https://{_authority}/oauth/token";
            var tokenRequest = new Auth0TokenRequest
            {
                client_id = _clientId,
                client_secret = _clientSecret,
                audience = _audience,
                grant_type = "client_credentials"
            };

            var content = new StringContent(JsonSerializer.Serialize(tokenRequest), Encoding.UTF8, "application/json");

            using (var client = new HttpClient())
            {
                var response = await client.PostAsync(tokenEndpoint, content);
                response.EnsureSuccessStatusCode();
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var jsonDoc = JsonDocument.Parse(jsonResponse);

                if (jsonDoc.RootElement.TryGetProperty("access_token", out var accessToken))
                {
                    return accessToken.GetString();
                }

                throw new Exception("Access token not found in the response.");
            }
        }

        public async Task<APIGatewayCustomAuthorizerResponse> IsAuthorized(string userId, string methodArn)
        {
            // var client = new HttpClient("https://christephanie.us.auth0.com/oauth/token");
            // var request = new RestRequest(Method.POST);
            // request.AddHeader("content-type", "application/json");
            // request.AddParameter("application/json", "{\"client_id\":\"BKIXT1TXuFmwP3HzIxzit48afofBufZG\",\"client_secret\":\"4__H6ZweOd42OUhP3od8ANVejged8H9jFZ9Ak7RYMnN3AMijYKS5jtpiCWyqEWuz\",\"audience\":\"https://api.wedding.christephanie.com\",\"grant_type\":\"client_credentials\"}", ParameterType.RequestBody);
            // IRestResponse response = client.Execute(request);
            Auth0User auth0User = null;

            var auth0Token = await GetAccessToken(); 
            if (string.IsNullOrEmpty(auth0Token))
            {
                throw new UnauthorizedAccessException("Failed to retrieve Auth0 Management API access token.");
            }

            // TODO SKS after token
            // services.AddAuthentication("Bearer")
            //     .AddJwtBearer("Bearer", options =>
            //     {
            //         options.Authority = "https://<your-auth0-domain>/";
            //         options.Audience = "https://api.christephanie.com";
            //     });

            var authEndpoint = $"https://{_authority}/api/v2/users/{userId}";
            using (var authClient = new HttpClient())
            {
                authClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", auth0Token);

                var authResponse = await authClient.GetAsync(authEndpoint);
                if (!authResponse.IsSuccessStatusCode)
                {
                    throw new Exception($"Failed to retrieve user from Auth0. Status code: {authResponse.StatusCode}");
                }

                var jsonResponse = await authResponse.Content.ReadAsStringAsync();
                auth0User = JsonSerializer.Deserialize<Auth0User>(jsonResponse);
            }

            if (auth0User == null)
            {
                throw new UnauthorizedAccessException("Failed to retrieve Auth0 user.");
            }

            // var jwtTokenHandler = new JwtSecurityTokenHandler();
            // var validationParameters = new TokenValidationParameters
            // {
            //     ValidateIssuer = true,
            //     ValidIssuer = $"{_audience}/",
            //     ValidateAudience = true,
            //     ValidAudience = _audience,
            //     ValidateLifetime = true,
            //     IssuerSigningKeyResolver = (auth0Token, securityToken, kid, parameters) =>
            //     {
            //         var client = new HttpClient();
            //         var keys = client.GetStringAsync($"{_audience}/.well-known/jwks.json").Result;
            //         var jsonWebKeySet = new JsonWebKeySet(keys);
            //         return jsonWebKeySet.GetSigningKeys();
            //     }
            // };
            //
            // var claimsPrincipal = jwtTokenHandler.ValidateToken(token, validationParameters, out _);
            // string userId = claimsPrincipal.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            //
            // if (string.IsNullOrEmpty(userId))
            //     throw new UnauthorizedAccessException("Invalid token");

            var queryRequest = new QueryRequest
            {
                TableName = _dynamoTableName,
                IndexName = _dynamoTableIdentityIndex,
                KeyConditionExpression = string.Format("{0} = :identityId", _dynamoTableIdentityCol),
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":identityId", new AttributeValue { S = auth0User.UserId } }
                }
            };

            var client = new AmazonDynamoDBClient();
            var response = await client.QueryAsync(queryRequest);
            var weddingEntity = _mapper.Map<WeddingEntity>(response);
            var user = _mapper.Map<GuestDto>(weddingEntity);

            if (user == null)
                throw new UnauthorizedAccessException("User not found");

            var permissions = user.Roles.Select(r => r.ToString().ToUpper());
            //var permissions = user["Roles"].AsListOfString();

            var requestedPermission = GetRequiredPermissionByEndpoint(methodArn);
            if (!permissions.Contains(requestedPermission))
                throw new UnauthorizedAccessException("Access denied");

            return GeneratePolicy(PolicyEffectEnum.Allow, methodArn, userId);
        }

        private string GetRequiredPermissionByEndpoint(string methodArn)
        {
            switch (methodArn)
            {
                case (LambdaArns.AdminFamilyUnitCreate):
                case (LambdaArns.AdminFamilyUnitUpdate):
                case (LambdaArns.AdminFamilyUnitDelete):
                    return RoleEnum.Admin.ToString().ToUpper();
                default:
                    return RoleEnum.Guest.ToString().ToUpper();
            }
        }

        public APIGatewayCustomAuthorizerResponse GeneratePolicy(PolicyEffectEnum effect, 
            string methodArn, 
            string? userId = null, 
            List<RoleEnum>? roles = null)
        {
            var roleContext = new APIGatewayCustomAuthorizerContextOutput();
            roleContext["roles"] = string.Join(",", roles.Select(role => role.ToString()));

            return new APIGatewayCustomAuthorizerResponse
            {
                PrincipalID = userId ?? "unknown",
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
                Context = roleContext
            };
        }

        public string? GetIdentity(WeddingEntity weddingEntity)
        {
            if (weddingEntity.Auth0Id == null || string.IsNullOrEmpty(weddingEntity.Auth0Id))
            {
                return null;
            }
            var matches = Regex.Matches(weddingEntity.Auth0Id!, AuthFormatHelper.AUTH_FORMAT);

            return matches
                .Cast<Match>()
                .FirstOrDefault(match => match.Groups[1].Value == SupportedAuthorizationProvidersEnum.Auth0.ToString())?
                .Groups[2].Value;
        }

        public void SetIdentity(WeddingEntity weddingEntity, string id)
        {
            if (string.IsNullOrEmpty(weddingEntity.Auth0Id))
            {
                weddingEntity.Auth0Id += $"{SupportedAuthorizationProvidersEnum.Auth0.ToString()}|{id};";
            }
            else
            {
                var matches = Regex.Matches(weddingEntity.Auth0Id!, AuthFormatHelper.AUTH_FORMAT);
                if (matches.Count > 0)
                {
                    weddingEntity.Auth0Id = Regex.Replace(weddingEntity.Auth0Id!, AuthFormatHelper.AUTH_FORMAT,
                        $"{SupportedAuthorizationProvidersEnum.Auth0.ToString()}|{id};");
                }
                else
                {
                    weddingEntity.Auth0Id += $"{SupportedAuthorizationProvidersEnum.Auth0.ToString()}|{id};";
                }
            }
        }

    }
}
