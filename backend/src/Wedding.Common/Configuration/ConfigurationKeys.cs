namespace Wedding.Common.Configuration
{
    public class ConfigurationKeys
    {
        #region Auth0
        /// <summary>
        /// The Auth0 config section
        /// </summary>
        public const string Auth0 = "Auth0";

        /// <summary>
        /// The Auth0 API base URL
        /// </summary>
        public const string Auth0ApiBaseUrl = Auth0 + ":ApiBaseUrl";
        #endregion

        #region USPS
        /// <summary>
        /// USPS developer API setup
        /// </summary>
        public const string USPS = "USPS";
        #endregion

        #region ConnectionStrings
        public const string ConnectionStrings = "ConnectionStrings";
        #endregion

        #region Database
        /// <summary>
        /// The database connection string
        /// </summary>
        public const string DatabaseConnectionString = "DatabaseConnectionString";

        /// <summary>
        /// Debug option only, use this database name instead of the one in the database connection string...
        /// </summary>
        public const string DevDatabaseOverride = "DevDatabaseOverride";

        /// <summary>
        /// Debug option only, should the EF context output sensitive data/debug information
        /// Any value in this config means 'yes'.  Do not set if no.
        /// </summary>
        public const string DevEfDiagnostics = "DevEfDiagnostics";
        #endregion
    }
}
