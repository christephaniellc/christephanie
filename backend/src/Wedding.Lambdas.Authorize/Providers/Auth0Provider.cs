using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using Wedding.Abstractions.Dtos.Auth0;
using Wedding.Common.Helpers.AWS;

namespace Wedding.Lambdas.Authorize.Providers
{
    public class Auth0Provider : IAuthenticationProvider
    {
        private string _authority;
        private string _audience;

        public Auth0Provider()
        {
        }

        public string GetAudience()
        {
            return _audience;
        }

        public async Task<Auth0User> GetUserInfo(string token)
        {
            try
            {
                var region = AwsRegionHelper.GetRegionEndpointFromEnvironment();
                var authConfig = await AwsParameterCache.GetAuthConfigAsync("/auth0/api/credentials", region);

                _authority = authConfig.Authority ?? throw new InvalidOperationException();
                _audience = authConfig.Audience ?? throw new InvalidOperationException();

                var userInfoEndpoint = $"{_authority}/userinfo";
                using (var authClient = new HttpClient())
                {
                    authClient.DefaultRequestHeaders.Authorization =
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                    var infoResponse = await authClient.GetAsync(userInfoEndpoint);
                    if (!infoResponse.IsSuccessStatusCode)
                    {
                        throw new Exception(
                            $"Failed to retrieve userinfo from Auth0. Status code: {infoResponse.StatusCode}");
                    }

                    var jsonResponse = await infoResponse.Content.ReadAsStringAsync();
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    return JsonSerializer.Deserialize<Auth0User>(jsonResponse, options);
                }
            }
            catch (Exception ex)
            {
                throw new UnauthorizedAccessException($"Authentication exception: {ex.Message}");
            }
        }
    }
}
