using System;
using System.Diagnostics;
using System.Reflection;

namespace Wedding.Common.Web.Http
{
    /// <summary>
    /// Class RepositoryEntityFrameworkActivitySource.
    /// </summary>
    ///
    //TODO: Rename to shared activity source name.
    public static class EFCosmosRepositoryActivitySource
    {
        internal static AssemblyName AssemblyName { get; } = typeof(EFCosmosRepositoryActivitySource).Assembly.GetName();

        internal static string ActivitySourceName => AssemblyName.Name!;

        /// <summary>
        /// Gets the version
        /// </summary>
        public static readonly Version Version = AssemblyName.Version!;

        /// <summary>
        /// Gets the actity source
        /// </summary>
        //TODO: Rename to ActivitySource
        public static readonly ActivitySource Source = new(ActivitySourceName, Version.ToString());
    }
}
