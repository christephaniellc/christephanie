using System;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Builder;

namespace Wedding.Common.Web.Options
{/// <summary>
 /// Post built options.
 /// </summary>
    [ExcludeFromCodeCoverage] // Simple data object
    public class DefaultApiPostBuildOptions : DefaultPostBuildOptions
    {
        /// <summary>
        /// Add UseStaticFiles
        /// </summary>
        public bool UseStaticFiles { get; set; } = true;

        /// <summary>
        /// Add default CacheControl to http
        /// </summary>
        public bool UseDefaultResponseCaching { get; set; } = true;

        /// <summary>
        /// Use to automatically map controllers. If you want to use minimal APIs, disable this option.
        /// </summary>
        public bool UseEndpointControllerMappings { get; set; } = true;

        // /// <summary>
        // /// Configure HealthCheck Options
        // /// </summary>
        // public void ConfigureHealthChecks(Action<PlatformHealthCheckOptions> configureHealthCheckOptions) => this.ConfigureHealthCheckOptions = configureHealthCheckOptions;

        /// <summary>
        /// Add UseAuthentication
        /// </summary>
        public bool UseAuthentication { get; set; } = true;

        /// <summary>
        /// Add UseAuthorization
        /// </summary>
        public bool UseAuthorization { get; set; } = true;

        /// <summary>
        /// Function to register any custom middleware that needs to be established prior to configuring the endpoints.<br/>
        /// This can be used in place of or in addition to the default middleware.<br/><br/>
        /// Any middleware registered within this function will follow the default middleware but precede the Authorization and Authentication middleware.
        /// </summary>
        public Func<IApplicationBuilder, IApplicationBuilder>? CustomMiddleware { get; set; } = null;

        // /// <summary>
        // /// Configure additional options for health checks
        // /// </summary>
        // internal Action<PlatformHealthCheckOptions>? ConfigureHealthCheckOptions { get; set; } = null;
    }

}
