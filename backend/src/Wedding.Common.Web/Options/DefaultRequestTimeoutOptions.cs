using System;
using Microsoft.AspNetCore.Http.Timeouts;

namespace Wedding.Common.Web.Options
{
    /// <summary>
    /// Request timeout options
    /// </summary>
    public class DefaultRequestTimeoutOptions
    {
        internal Action<RequestTimeoutOptions>? Options { get; set; }

        /// <summary>
        /// Default for all requests
        /// </summary>
        public TimeSpan DefaultTimeout { get; set; } = TimeSpan.FromSeconds(30);

        /// <summary>
        /// Optional, exposes all options from https://learn.microsoft.com/en-us/aspnet/core/performance/timeouts?view=aspnetcore-8.0
        /// </summary>

        public void AdditionalConfiguration(Action<RequestTimeoutOptions> options) => Options = options;
    }
}
