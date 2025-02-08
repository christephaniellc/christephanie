using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;

namespace Wedding.Common.Helpers.AWS
{
    public class AwsParameterCache
    {
        /// <summary>
        /// 300 seconds = 5 minutes
        /// 3600 seconds = 60 minutes
        /// </summary>
        private const int _defaultCacheDurationInSeconds = 3600;
        private static readonly MemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
        
        private static readonly Dictionary<Type, string> _configParameterMap = new Dictionary<Type, string>
        {
            { typeof(Auth0Configuration), "/config/auth0/properties" },
            { typeof(UspsConfiguration), "/config/usps/api-credentials" },
        };

        public static async Task<T> GetConfigAsync<T>(int? cacheDurationInSeconds = null, bool forceRefresh = false)
        {
            if (!_configParameterMap.TryGetValue(typeof(T), out var parameterName))
            {
                throw new InvalidOperationException($"No parameter mapping found for type {typeof(T).Name}");
            }

            var cacheKey = GetCacheKey<T>(parameterName);

            if (forceRefresh)
            {
                InvalidateCache<T>(cacheKey);
            }

            if (_cache.TryGetValue(cacheKey, out T? cachedValue))
            {
                if (cachedValue != null)
                {
                    return cachedValue;
                }
            }

            Console.WriteLine($"Cache expired. Fetching parameter store parameter: {cacheKey}");

            try
            {
                var region = AwsRegionHelper.GetRegionEndpointFromEnvironment();
                var config = await AwsParameterStoreHelper.GetParameterAsync<T>(parameterName, region);

                SetCache(cacheKey, config, cacheDurationInSeconds);

                return config;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error fetching parameter '{parameterName}': {ex.Message}", ex);
            }
        }

        private static string GetCacheKey<T>(string parameterName)
        {
            return $"{parameterName}_{typeof(T).FullName}";
        }

        private static void SetCache<T>(string cacheKey, T cacheValue, int? cacheDurationInSeconds)
        {
            var cacheTimeSpan = cacheDurationInSeconds.HasValue ? cacheDurationInSeconds.Value : _defaultCacheDurationInSeconds;
            var cacheDuration = TimeSpan.FromSeconds(cacheTimeSpan);
            _cache.Set(cacheKey, cacheValue, cacheDuration);
        }

        public static void InvalidateCache<T>(string parameterName)
        {
            var cacheKey = GetCacheKey<T>(parameterName);
            _cache.Remove(cacheKey);
        }
    }
}
