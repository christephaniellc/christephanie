using System.Net.Http;
using Wedding.Common.Web.Http;

namespace Wedding.Common.Web.Extensions
{
    /// <summary>
    /// Http client factory extensions
    /// </summary>
    public static class HttpClientFactoryExtensions
    {
        /// <summary>
        /// Avoid creating a new client every time by using a static delegate.
        /// </summary>
        /// <param name="factory"></param>
        /// <returns></returns>
        public static HttpClient CreateCosmosHttpClient(this IHttpClientFactory factory) => factory.CreateClient(OpenTelemetryHttpHandler.ClientName);
    }
}
