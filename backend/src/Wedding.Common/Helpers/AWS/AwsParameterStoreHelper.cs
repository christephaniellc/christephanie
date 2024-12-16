using System;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon;
using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;

namespace Wedding.Common.Helpers.AWS
{
    public static class AwsParameterStoreHelper
    {
        public static async Task<T> GetParameterAsync<T>(string parameterName, RegionEndpoint region)
        {
            using var client = new AmazonSimpleSystemsManagementClient(region);
            var request = new GetParameterRequest
            {
                Name = parameterName,
                WithDecryption = true
            };

            var response = await client.GetParameterAsync(request);

            return JsonSerializer.Deserialize<T>(response.Parameter.Value)
                   ?? throw new InvalidOperationException("Unable to find AWS parameter");
        }
    }
}
