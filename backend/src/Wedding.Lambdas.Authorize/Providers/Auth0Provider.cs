using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using System.Text.Json;
using Wedding.Abstractions.Dtos.Auth0;

namespace Wedding.Lambdas.Authorize.Providers
{
    public class Auth0Provider : IAuthenticationProvider
    {
        private readonly IMapper _mapper;
        private readonly string _authority;
        private readonly string _audience;

        public Auth0Provider(
            IMapper mapper,
            string authority, 
            string audience)
        {
            _mapper = mapper;
            _authority = authority;
            _audience = audience;
        }

        public string GetAudience()
        {
            return _audience;
        }

        public async Task<Auth0User> GetUserInfo(string token)
        {
            try
            {
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
