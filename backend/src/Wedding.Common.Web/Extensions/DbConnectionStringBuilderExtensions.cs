using System.Data.Common;

namespace Wedding.Common.Web.Extensions
{
    public static class DbConnectionStringBuilderExtensions
    {
        /// <summary>
        /// The database name
        /// </summary>
        public const string DatabaseName = "Database";
        /// <summary>
        /// The account endpoint
        /// </summary>
        public const string AccountEndpoint = "AccountEndpoint";
        /// <summary>
        /// The account key
        /// </summary>
        public const string AccountKey = "AccountKey";

        /// <summary>Gets the name of the database.</summary>
        /// <param name="builder">The builder.</param>
        /// <returns></returns>
        public static string GetDatabaseName(this DbConnectionStringBuilder builder)
            => builder.GetStringValue(DatabaseName);

        /// <summary>Gets the URL to Cosmos DB.</summary>
        /// <param name="builder">The builder.</param>
        /// <returns></returns>
        public static string GetAccountEndpoint(this DbConnectionStringBuilder builder)
            => builder.GetStringValue(AccountEndpoint);

        /// <summary>Gets the URL to Cosmos DB.</summary>
        /// <param name="builder">The builder.</param>
        /// <returns></returns>
        public static string GetAccountKey(this DbConnectionStringBuilder builder)
            => builder.GetStringValue(AccountKey);

        private static string GetStringValue(this DbConnectionStringBuilder builder, string key)
        {
            if (!builder.TryGetValue(key, out var obj))
            {
                return string.Empty;
            }

            var str = obj as string ?? string.Empty;
            return string.IsNullOrEmpty(str) ? string.Empty : str;
        }
    }

}
