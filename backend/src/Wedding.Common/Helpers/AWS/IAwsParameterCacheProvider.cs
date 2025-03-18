using System.Threading.Tasks;

namespace Wedding.Common.Helpers.AWS
{
    public interface IAwsParameterCacheProvider
    {
        Task<T> GetConfigAsync<T>();
    }
}
