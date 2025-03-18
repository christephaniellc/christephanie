using System.Threading.Tasks;

namespace Wedding.Common.Helpers.AWS
{
    public class AwsParameterCacheProvider : IAwsParameterCacheProvider
    {
        public Task<T> GetConfigAsync<T>()
        {
            return AwsParameterCache.GetConfigAsync<T>();
        }
    }
}
