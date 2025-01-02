using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Wedding.Common.Web.Enums;

namespace Wedding.Common.Web.Options
{/// <summary>
 /// Role options
 /// </summary>
    [ExcludeFromCodeCoverage] // Simple data object
    public abstract class DefaultRoleOptions<TPostBuildRoleOptions>
        where TPostBuildRoleOptions : DefaultPostBuildOptions, new()
    {
        /// <summary>
        /// Gets or sets the primary data store
        /// </summary>
        public SupportedDataStoresEnum PrimaryDataStore { get; set; } = SupportedDataStoresEnum.CosmosDb;

        /// <summary>
        /// Gets the discoverable assemblies for the role.
        /// </summary>
        public Assembly[] Assemblies { get; }

        /// <summary>
        /// Use the default logging setup
        /// </summary>
        public bool UseDefaultLogging { get; set; } = true;

        /// <summary>
        /// Use the default telemetry setup
        /// </summary>
        public bool UseDefaultObservability { get; set; } = true;

        /// <summary>
        /// Gets or sets whether the console appender is enabled for Telemetry and Metrics provider in Development,
        /// defaults to false as these are rather noisy - and the traces are available via Jaeger in a much nicer form.
        /// </summary>
        public bool EnableDevelopmentConsoleObservability { get; set; } = false;

        /// <summary>
        /// Use the default response caching
        /// </summary>
        public bool UseDefaultHttpCaching { get; set; } = true;

        /// <summary>
        /// Apply basic AutoMapper configuration
        /// </summary>
        public bool UseDefaultDataMapping { get; set; } = true;

        /// <summary>
        /// Use the default serialization setup
        /// </summary>
        public bool UseDefaultSerialization { get; set; } = true;

        /// <summary>
        /// Turn on default MultiTenancy feature
        /// </summary>
        public bool UseDefaultMultiTenancy { get; set; } = true;
        /// <summary>
        /// Turn on default FeatureFlags feature
        /// </summary>
        public bool UseDefaultFeatureFlags { get; set; } = true;

        /// <summary>
        /// Turn on default setup of message queue buses and their middleware
        /// </summary>
        public bool UseDefaultMessaging { get; set; } = true;

        /// <summary>
        /// Utilize singleton instance of message bus or transient. Use transient by default.
        /// </summary>
        public bool UseTransientInternalBus { get; set; } = true;

        /// <summary>
        /// Utilize singleton instance of message bus or transient. Use transient by default.
        /// </summary>
        public bool UseTransientPlatformBus { get; set; } = true;

        // /// <summary>
        // /// Separated mqc behavior for internal communication
        // /// </summary>
        // public CommonBusBehaviourType InternalBusCommonBusBehaviourType { get; set; } = CommonBusBehaviourType.Default;
        //
        // /// <summary>
        // /// Separated mqc behavior for platform communication
        // /// </summary>
        // public CommonBusBehaviourType PlatformBusCommonBusBehaviourType { get; set; } = CommonBusBehaviourType.Default;

        /// <summary>
        /// Turn on health endpoint and setup auto health checks
        /// </summary>
        public bool UseDefaultHealthChecks { get; set; } = true;

        /// <summary>
        /// Use default DI setting for enabling user context
        /// </summary>
        public bool UseUserContext { get; set; } = true;

        /// <summary>
        /// FromFrontendOptions for applying post build 
        /// </summary>
        public TPostBuildRoleOptions PostBuildOptions { get; set; } = new();

        /// <summary>
        /// Set auto health check options
        /// </summary>
        public HealthCheckOptions HealthCheckOptions { get; set; } = new();

        /// <summary>
        /// Creates a new instance of the options.
        /// </summary>
        /// <param name="assemblies"></param>
        protected DefaultRoleOptions(params Assembly[] assemblies) => Assemblies = assemblies;
    }

}
