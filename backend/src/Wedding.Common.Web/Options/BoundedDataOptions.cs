namespace Wedding.Common.Web.Options
{
    /// <summary>
    /// FromFrontendOptions for specifying what Data Boundary value should be used.
    /// </summary>
    public class BoundedDataOptions
    {
        /// <summary>
        /// Whether to look to the Run time cluster information for the default data boundary.
        /// </summary>
        public bool UseRuntimeDataBoundary { get; set; } = false;
    }
}
