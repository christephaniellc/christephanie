using System;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Microsoft.AspNetCore.Builder;

namespace Wedding.Common.Web.Extensions
{
    /// <summary>
    /// Web application builder extensions
    /// </summary>
    [ExcludeFromCodeCoverage]
    public static class WebApplicationBuilderExtensions
    {
        /// <summary>
        /// Creates a builder for a role with default settings.
        /// </summary>
        /// <param name="builder"></param>
        /// <param name="entryPoint"></param>
        /// <param name="assemblies"></param>
        /// <returns></returns>
        public static PublicApiApplicationBuilder ForRole(this WebApplicationBuilder builder, Type entryPoint, params Assembly[] assemblies) => ForRole(builder, entryPoint, true, assemblies);

        /// <summary>
        /// Creates a builder for a role.
        /// </summary>
        /// <param name="builder"></param>6
        /// <param name="entryPoint"></param>
        /// <param name="useDefaultConfiguration"></param>
        /// <param name="assemblies"></param>
        /// <returns></returns>
        public static PublicApiApplicationBuilder ForRole(this WebApplicationBuilder builder, Type entryPoint, bool useDefaultConfiguration, params Assembly[] assemblies) => new PublicApiApplicationBuilder(builder, entryPoint, useDefaultConfiguration, assemblies);

    }
}
