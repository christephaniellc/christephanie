using System;
using System.Text.Json;
using Amazon.SecretsManager.Model;
using Amazon.SecretsManager;
using System.Threading.Tasks;
using Amazon;

namespace Wedding.Common.Helpers.AWS
{
    public static class AwsSecretsHelper
    {
        public static async Task<T> GetSecretAsync<T>(string secretName, RegionEndpoint region)
        {
            using var client = new AmazonSecretsManagerClient(region);
            var request = new GetSecretValueRequest { SecretId = secretName };
            var response = await client.GetSecretValueAsync(request);
            return JsonSerializer.Deserialize<T>(response.SecretString)
                   ?? throw new InvalidOperationException("Cannot find AWS secret");
        }
    }
}
