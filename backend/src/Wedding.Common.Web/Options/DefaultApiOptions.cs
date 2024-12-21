using System;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;

namespace Wedding.Common.Web.Options
{/// <summary>
 /// Default API options
 /// </summary>
    [ExcludeFromCodeCoverage] // Simple data object
    public class DefaultApiOptions : DefaultRoleOptions<DefaultApiPostBuildOptions>
    {
        /// <summary>
        /// Creates a new instance of public API options.
        /// </summary>
        /// <param name="assemblies"></param>
        /// <exception cref="NotImplementedException"></exception>
        public DefaultApiOptions(params Assembly[] assemblies) : base(assemblies)
        {

        }

        /// <summary>
        /// services.AddCors()
        /// </summary>
        public bool UseDefaultCors { get; set; } = true;

        /// <summary>
        /// Add default open api setup
        /// </summary>
        public bool UseDefaultAnonymousApiDocs { get; set; } = true;

        /// <summary>
        /// app.UseApiDocs()
        /// </summary>
        public bool UseDefaultApiDocs { get; set; } = true;

        /// <summary>
        /// Adds service API versioning to the specified services collection
        /// </summary>
        public bool UseDefaultApiVersioning { get; set; } = true;

        /// <summary>
        /// Add bearer authentication
        /// </summary>
        public bool UseDefaultAuthentication { get; set; } = true;

        /// <summary>
        /// Apply mandatory authorization
        /// </summary>
        public bool UseDefaultAuthorization { get; set; } = true;

        /// <summary>
        /// services.AddResponseCaching()
        /// </summary>
        public bool UseDefaultResponseCaching { get; set; } = true;

        /// <summary>
        /// Add all handler from all app assemblies
        /// </summary>
        public bool UseDefaultHandlers { get; set; } = true;

        /// <summary>
        /// Serialize enum as int
        /// </summary>
        public bool UseStringEnumSerialization { get; set; }

        /// <summary>
        /// The rewritten path if running via public ingress. For open api
        /// </summary>
        public string? ServiceIngressRewriteBase { get; set; } = null;

        /// <summary>
        /// Use request timeouts
        /// reference: https://learn.microsoft.com/en-us/aspnet/core/performance/timeouts?view=aspnetcore-8.0
        /// </summary>
        internal Action<DefaultRequestTimeoutOptions>? ConfigureRequestTimeouts;

        // /// <summary>
        // /// Use request timeouts
        // /// reference: https://learn.microsoft.com/en-us/aspnet/core/performance/timeouts?view=aspnetcore-8.0
        // /// </summary>
        // /// <param name="configure"></param>
        // public void UseRequestTimeouts(Action<DefaultRequestTimeoutOptions> configure) => ConfigureRequestTimeouts = configure;
        //
        // /// <summary>
        // /// Apply additional configurations to open telemetry metrics
        // /// </summary>
        // internal Action<MeterProviderBuilder>? ConfigureOpenTelemetryMetricsInternal;
        //
        // /// <summary>
        // /// Apply additional configurations to open telemetry traces, such as additional sources with AddSource
        // /// </summary>
        // internal Action<TracerProviderBuilder>? ConfigureOpenTelemetryTracesInternal;
        //
        // /// <summary>
        // /// Apply additional configurations to open telemetry metrics
        // /// </summary>
        // /// <param name="configure"></param>
        // public void ConfigureOpenTelemetryMetrics(Action<MeterProviderBuilder> configure) => ConfigureOpenTelemetryMetricsInternal = configure;
        //
        // /// <summary>
        // /// Apply additional configurations to open telemetry traces, such as additional sources with AddSource
        // /// </summary>
        // /// <param name="configure"></param>
        // public void ConfigureOpenTelemetryTraces(Action<TracerProviderBuilder> configure) => ConfigureOpenTelemetryTracesInternal = configure;
    }

}
