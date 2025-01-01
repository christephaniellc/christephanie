using Amazon.SimpleSystemsManagement.Model;
using Amazon.SimpleSystemsManagement;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon;
using Wedding.Common.Configuration.Identity;

namespace Wedding.Common.Helpers.AWS
{
    public class AwsParameterCache
    {
        private static Auth0Configuration? _cachedAuthConfig; // Static cache
        private static DateTime _cacheExpirationTime = DateTime.MinValue; // Expiration timestamp
        private const int CacheDurationInSeconds = 300; // Cache duration (e.g., 5 minutes)

        public static async Task<Auth0Configuration> GetAuthConfigAsync(string parameterName, RegionEndpoint region)
        {
            // Return cached value if valid
            if (_cachedAuthConfig != null && DateTime.UtcNow < _cacheExpirationTime)
            {
                return _cachedAuthConfig;
            }

            using var client = new AmazonSimpleSystemsManagementClient(region);

            var request = new GetParameterRequest
            {
                Name = parameterName,
                WithDecryption = true
            };

            try
            {
                var response = await client.GetParameterAsync(request);

                // Deserialize JSON value into MyAuthConfig
                var authConfig = JsonSerializer.Deserialize<Auth0Configuration>(response.Parameter.Value)
                                 ?? throw new InvalidOperationException($"Failed to deserialize parameter: {parameterName}");

                // Cache the result
                _cachedAuthConfig = authConfig;
                _cacheExpirationTime = DateTime.UtcNow.AddSeconds(CacheDurationInSeconds);

                return authConfig;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error fetching parameter '{parameterName}': {ex.Message}", ex);
            }
        }

        public static void ClearCache()
        {
            _cachedAuthConfig = null;
            _cacheExpirationTime = DateTime.MinValue;
        }
    }
}
