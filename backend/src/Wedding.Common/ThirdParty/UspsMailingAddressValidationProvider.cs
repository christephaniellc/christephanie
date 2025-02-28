using Microsoft.Extensions.Logging;
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
        private readonly ILogger<UspsMailingAddressValidationProvider> _logger;
        private readonly string _uspsApiUrl;
        private readonly string _consumerKey;
        private readonly string _consumerSecret;

        public UspsMailingAddressValidationProvider(ILogger<UspsMailingAddressValidationProvider> logger, string uspsApiUrl, string consumerKey, string consumerSecret)
        {
            _logger = logger;
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
            _logger.LogInformation($"Getting USPS access token...");
            var accessToken = await GetAccessToken();
            _logger.LogInformation($"USPS AccessToken received.");

            var requestUri = string.Format("{0}/addresses/v3/", _uspsApiUrl);
            var requestParams = address.ToQueryString(toCamelCase: true);
            requestUri += "address?" + requestParams;

            _logger.LogInformation($"requestUri: {requestUri}");
            _logger.LogInformation($"Validate address: {JsonSerializer.Serialize(address)}");

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var uspsResponse = await client.GetAsync(requestUri);
                _logger.LogInformation($"uspsResponse: {JsonSerializer.Serialize(uspsResponse)}");
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
