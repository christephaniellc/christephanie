using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Helpers.AWS;

namespace Wedding.Lambdas.Authorize.Providers
{
    public class Auth0Provider : IAuthenticationProvider
    {
        public Auth0Provider()
        {
        }

        public async Task<Auth0Configuration> GetConfig()
        {
            var region = AwsRegionHelper.GetRegionEndpointFromEnvironment();
            return await AwsParameterCache.GetAuthConfigAsync("/auth0/api/credentials", region);
        }

        public async Task<string> GetAuthority()
        {
            return (await GetConfig()).Authority ?? throw new InvalidOperationException();
        }

        public async Task<string> GetAudience()
        {
            return (await GetConfig()).Audience ?? throw new InvalidOperationException();
        }

        public async Task<Auth0User> GetUserInfo(string token)
        {
            try
            {
                var authority = await GetAuthority();
                var userInfoEndpoint = $"{authority}/userinfo";
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
                    Console.WriteLine($"Auth0Provider jsonResponse: {jsonResponse}");
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
