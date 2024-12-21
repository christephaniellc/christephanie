namespace Wedding.Common.Web.Http
{
    internal static class SemanticConventionsExLocal
    {
        //Source: https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/src/OpenTelemetry.Api/Internal/SemanticConventions.cs

        // The set of constants matches the specification as of this commit.
        // https://github.com/open-telemetry/opentelemetry-specification/tree/main/specification/trace/semantic_conventions
        // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/exceptions.md

        public const string AttributeDbAzureCosmos = "db.azure.cosmos";

    }
}
