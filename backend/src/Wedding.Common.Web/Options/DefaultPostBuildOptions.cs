using System.Diagnostics.CodeAnalysis;

namespace Wedding.Common.Web.Options
{
    /// <summary>
    /// Post built options.
    /// </summary>
    [ExcludeFromCodeCoverage] // Simple data object
    public class DefaultPostBuildOptions
    {
        /// <summary>
        /// Add cors policy, UseDeveloperExceptionPage etc
        /// </summary>
        public bool UseCoreApplicationConfiguration { get; set; } = true;

        /// <summary>
        /// Add healthchecks default endpoints
        /// </summary>
        public bool UseHealthChecks { get; set; } = true;

        /// <summary>
        /// Add default middleware by role
        /// </summary>
        public bool UseDefaultMiddleware { get; set; } = true;

    }
}
