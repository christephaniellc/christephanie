using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Wedding.Common.Web.Http
{
    /// <summary>
    /// Handler used to capture query metrics
    /// </summary>
    public class OpenTelemetryHttpHandler : DelegatingHandler
    {
        /// <summary>
        /// Name for the HTTP client to be used by Cosmos
        /// </summary>
        public const string ClientName = "X:CosmosHttpClient";

        readonly bool _sensitiveDataLoggingIsEnabled;

        /// <summary>
        /// Initializes a new instance of the <see cref="OpenTelemetryHttpHandler"/> class.
        /// </summary>
        /// <param name="sensitiveDataLoggingIsEnabled">if set to <see langword="true" /> enables sensitive data logging, e.g. DB statements and insert data.</param>
        public OpenTelemetryHttpHandler(bool sensitiveDataLoggingIsEnabled = false) => _sensitiveDataLoggingIsEnabled = sensitiveDataLoggingIsEnabled;

        /// <inheritdoc />
        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            using var activity = EFCosmosRepositoryActivitySource.Source.StartActivity(
                                    $"{request.Method} {request.RequestUri!.OriginalString}",
                                    ActivityKind.Client);

            var responseTask = base.SendAsync(request, cancellationToken).ConfigureAwait(false);

            if (activity is null)
                return await responseTask;

            // process the request, while waiting for the response - https://learn.microsoft.com/en-us/rest/api/cosmos-db/common-cosmosdb-rest-request-headers
            activity.SetTag(SemanticConventions.AttributeDbSystem, "Azure DocumentDB");
            activity.SetTag(SemanticConventions.AttributeHttpUrl, request.RequestUri.OriginalString);

            if (_sensitiveDataLoggingIsEnabled && request.Content is not null)
                activity.SetTag(
                    SemanticConventions.AttributeDbStatement,
                    await request.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false));

            foreach (var header in request.Headers.Where(h => h.Key.StartsWith("x-ms-", true, CultureInfo.InvariantCulture)))
                activity.SetTag(
                    $"{SemanticConventionsExLocal.AttributeDbAzureCosmos}.{header.Key.Replace("x-ms-", "", true, CultureInfo.InvariantCulture).Replace("-", ".", true, CultureInfo.InvariantCulture)}",
                    header.Value.Count() == 1 ? header.Value.First() : header.Value);

            // finish waiting for the response
            var response = await responseTask;

            // process the response - https://learn.microsoft.com/en-us/rest/api/cosmos-db/common-cosmosdb-rest-response-headers
            activity.SetTag(SemanticConventions.AttributeHttpStatusCode, response.StatusCode);
            foreach (var header in response.Headers.Where(h => h.Key.StartsWith("x-ms-", true, CultureInfo.InvariantCulture)))
                activity.SetTag(
                    $"{SemanticConventionsExLocal.AttributeDbAzureCosmos}.{header.Key.Replace("x-ms-", "", true, CultureInfo.InvariantCulture).Replace("-", ".", true, CultureInfo.InvariantCulture)}",
                    header.Value.Count() == 1 ? header.Value.First() : header.Value);

            return response;
        }
    }
}
