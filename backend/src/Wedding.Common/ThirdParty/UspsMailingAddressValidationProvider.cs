using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.USPS;
using Wedding.Common.Helpers;

namespace Wedding.Common.ThirdParty
{
    public class UspsMailingAddressValidationProvider : IUspsMailingAddressValidationProvider
    {
        private readonly string _uspsApiUrl;
        private readonly string _consumerKey;
        private readonly string _consumerSecret;

        public UspsMailingAddressValidationProvider(string uspsApiUrl, string consumerKey, string consumerSecret)
        {
            _uspsApiUrl = uspsApiUrl;
            _consumerKey = consumerKey;
            _consumerSecret = consumerSecret;
        }

        private async Task<string?> GetAccessToken()
        {
            var requestUri = string.Format("{0}/oauth2/v3/token", _uspsApiUrl);
            var tokenRequest = new UspsTokenRequest
            {
                client_id = _consumerKey,
                client_secret = _consumerSecret,
                grant_type = "client_credentials"
            };

            var content = new StringContent(JsonSerializer.Serialize(tokenRequest), Encoding.UTF8, "application/json");

            using (var client = new HttpClient())
            {
                var response = await client.PostAsync(requestUri, content); 
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

        public async Task<AddressDto> ValidateAddress(AddressDto address)
        {
            var accessToken = await GetAccessToken();

            var requestUri = string.Format("{0}/addresses/v3/", _uspsApiUrl);
            var requestParams = address.ToQueryString(toCamelCase: true);
            requestUri += "address?" + requestParams;

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var uspsResponse = await client.GetAsync(requestUri);
                uspsResponse.EnsureSuccessStatusCode();

                var json = await uspsResponse.Content.ReadAsStringAsync();
                var response = JsonSerializer.Deserialize<UspsAddressDto>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return (response?.Address ?? null) ?? address;
            }
        }
    }
}
