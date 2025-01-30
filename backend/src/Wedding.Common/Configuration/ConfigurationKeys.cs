namespace Wedding.Common.Configuration
{
    public class ConfigurationKeys
    {
        #region Auth0
        /// <summary>
        /// Switch between Authorization providers
        /// </summary>
        public const string Authorization = "Authorization";
        
        /// <summary>
        /// The Auth0 config section
        /// </summary>
        public const string Auth0 = "Auth0";

        /// <summary>
        /// The Auth0 authority / issuer URL
        /// </summary>
        public const string AuthenticationAuthority = Auth0 + ":Authority";

        /// <summary>
        /// The Auth0 audience URL
        /// </summary>
        public const string AuthenticationAudience = Auth0 + ":Audience";

        /// <summary>
        /// The Auth0 client id
        /// </summary>
        public const string AuthenticationClientIdM2M = Auth0 + ":ClientId";

        /// <summary>
        /// The Auth0 client secret
        /// </summary>
        public const string AuthenticationClientSecretM2M = Auth0 + ":ClientSecret";
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

        #region Multitenancy
        /// <summary>
        /// Multitenancy setup
        /// </summary>
        public const string Multitenancy = "Multitenancy";
        #endregion
    }
}
