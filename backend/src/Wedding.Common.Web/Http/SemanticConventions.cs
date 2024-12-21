namespace Wedding.Common.Web.Http
{
    //
    // Summary:
    //     Constants for semantic attribute names outlined by the OpenTelemetry specifications.
    //     https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/README.md.
    //
    //
    // Remarks:
    //     Source https://raw.githubusercontent.com/open-telemetry/opentelemetry-dotnet/core-1.4.0/src/OpenTelemetry.Api/Internal/SemanticConventions.cs
    public static class SemanticConventions
    {
        public const string AttributeNetTransport = "net.transport";

        public const string AttributeNetPeerIp = "net.peer.ip";

        public const string AttributeNetPeerPort = "net.peer.port";

        public const string AttributeNetPeerName = "net.peer.name";

        public const string AttributeNetHostIp = "net.host.ip";

        public const string AttributeNetHostPort = "net.host.port";

        public const string AttributeNetHostName = "net.host.name";

        public const string AttributeEnduserId = "enduser.id";

        public const string AttributeEnduserRole = "enduser.role";

        public const string AttributeEnduserScope = "enduser.scope";

        public const string AttributePeerService = "peer.service";

        public const string AttributeHttpMethod = "http.method";

        public const string AttributeHttpUrl = "http.url";

        public const string AttributeHttpTarget = "http.target";

        public const string AttributeHttpHost = "http.host";

        public const string AttributeHttpScheme = "http.scheme";

        public const string AttributeHttpStatusCode = "http.status_code";

        public const string AttributeHttpStatusText = "http.status_text";

        public const string AttributeHttpFlavor = "http.flavor";

        public const string AttributeHttpServerName = "http.server_name";

        public const string AttributeHttpRoute = "http.route";

        public const string AttributeHttpClientIP = "http.client_ip";

        public const string AttributeHttpUserAgent = "http.user_agent";

        public const string AttributeHttpRequestContentLength = "http.request_content_length";

        public const string AttributeHttpRequestContentLengthUncompressed = "http.request_content_length_uncompressed";

        public const string AttributeHttpResponseContentLength = "http.response_content_length";

        public const string AttributeHttpResponseContentLengthUncompressed = "http.response_content_length_uncompressed";

        public const string AttributeDbSystem = "db.system";

        public const string AttributeDbConnectionString = "db.connection_string";

        public const string AttributeDbUser = "db.user";

        public const string AttributeDbMsSqlInstanceName = "db.mssql.instance_name";

        public const string AttributeDbJdbcDriverClassName = "db.jdbc.driver_classname";

        public const string AttributeDbName = "db.name";

        public const string AttributeDbStatement = "db.statement";

        public const string AttributeDbOperation = "db.operation";

        public const string AttributeDbInstance = "db.instance";

        public const string AttributeDbUrl = "db.url";

        public const string AttributeDbCassandraKeyspace = "db.cassandra.keyspace";

        public const string AttributeDbHBaseNamespace = "db.hbase.namespace";

        public const string AttributeDbRedisDatabaseIndex = "db.redis.database_index";

        public const string AttributeDbMongoDbCollection = "db.mongodb.collection";

        public const string AttributeRpcSystem = "rpc.system";

        public const string AttributeRpcService = "rpc.service";

        public const string AttributeRpcMethod = "rpc.method";

        public const string AttributeRpcGrpcStatusCode = "rpc.grpc.status_code";

        public const string AttributeMessageType = "message.type";

        public const string AttributeMessageId = "message.id";

        public const string AttributeMessageCompressedSize = "message.compressed_size";

        public const string AttributeMessageUncompressedSize = "message.uncompressed_size";

        public const string AttributeFaasTrigger = "faas.trigger";

        public const string AttributeFaasExecution = "faas.execution";

        public const string AttributeFaasDocumentCollection = "faas.document.collection";

        public const string AttributeFaasDocumentOperation = "faas.document.operation";

        public const string AttributeFaasDocumentTime = "faas.document.time";

        public const string AttributeFaasDocumentName = "faas.document.name";

        public const string AttributeFaasTime = "faas.time";

        public const string AttributeFaasCron = "faas.cron";

        public const string AttributeMessagingSystem = "messaging.system";

        public const string AttributeMessagingDestination = "messaging.destination";

        public const string AttributeMessagingDestinationKind = "messaging.destination_kind";

        public const string AttributeMessagingTempDestination = "messaging.temp_destination";

        public const string AttributeMessagingProtocol = "messaging.protocol";

        public const string AttributeMessagingProtocolVersion = "messaging.protocol_version";

        public const string AttributeMessagingUrl = "messaging.url";

        public const string AttributeMessagingMessageId = "messaging.message_id";

        public const string AttributeMessagingConversationId = "messaging.conversation_id";

        public const string AttributeMessagingPayloadSize = "messaging.message_payload_size_bytes";

        public const string AttributeMessagingPayloadCompressedSize = "messaging.message_payload_compressed_size_bytes";

        public const string AttributeMessagingOperation = "messaging.operation";

        public const string AttributeExceptionEventName = "exception";

        public const string AttributeExceptionType = "exception.type";

        public const string AttributeExceptionMessage = "exception.message";

        public const string AttributeExceptionStacktrace = "exception.stacktrace";
    }
#if false // Decompilation log
'296' items in cache
------------------
Resolve: 'System.Runtime, Version=6.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
Found single assembly: 'System.Runtime, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
WARN: Version mismatch. Expected: '6.0.0.0', Got: '8.0.0.0'
Load from: 'C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.11\ref\net8.0\System.Runtime.dll'
------------------
Resolve: 'OpenTelemetry.Api, Version=1.0.0.0, Culture=neutral, PublicKeyToken=7bd6737fe5b67e3c'
Found single assembly: 'OpenTelemetry.Api, Version=1.0.0.0, Culture=neutral, PublicKeyToken=7bd6737fe5b67e3c'
Load from: 'C:\Users\sstubler\.nuget\packages\opentelemetry.api\1.10.0\lib\net8.0\OpenTelemetry.Api.dll'
------------------
Resolve: 'OpenTelemetry, Version=1.0.0.0, Culture=neutral, PublicKeyToken=7bd6737fe5b67e3c'
Found single assembly: 'OpenTelemetry, Version=1.0.0.0, Culture=neutral, PublicKeyToken=7bd6737fe5b67e3c'
Load from: 'C:\Users\sstubler\.nuget\packages\opentelemetry\1.10.0\lib\net8.0\OpenTelemetry.dll'
------------------
Resolve: 'System.Collections, Version=6.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
Found single assembly: 'System.Collections, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
WARN: Version mismatch. Expected: '6.0.0.0', Got: '8.0.0.0'
Load from: 'C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.11\ref\net8.0\System.Collections.dll'
------------------
Resolve: 'System.Diagnostics.DiagnosticSource, Version=8.0.0.0, Culture=neutral, PublicKeyToken=cc7b13ffcd2ddd51'
Found single assembly: 'System.Diagnostics.DiagnosticSource, Version=9.0.0.0, Culture=neutral, PublicKeyToken=cc7b13ffcd2ddd51'
WARN: Version mismatch. Expected: '8.0.0.0', Got: '9.0.0.0'
Load from: 'C:\Users\sstubler\.nuget\packages\system.diagnostics.diagnosticsource\9.0.0\lib\net8.0\System.Diagnostics.DiagnosticSource.dll'
------------------
Resolve: 'Microsoft.AspNetCore.Http.Abstractions, Version=2.2.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
Found single assembly: 'Microsoft.AspNetCore.Http.Abstractions, Version=2.2.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
Load from: 'C:\Users\sstubler\.nuget\packages\microsoft.aspnetcore.http.abstractions\2.2.0\lib\netstandard2.0\Microsoft.AspNetCore.Http.Abstractions.dll'
------------------
Resolve: 'System.Security.Claims, Version=6.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
Found single assembly: 'System.Security.Claims, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
WARN: Version mismatch. Expected: '6.0.0.0', Got: '8.0.0.0'
Load from: 'C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.11\ref\net8.0\System.Security.Claims.dll'
------------------
Resolve: 'System.Diagnostics.FileVersionInfo, Version=6.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
Found single assembly: 'System.Diagnostics.FileVersionInfo, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
WARN: Version mismatch. Expected: '6.0.0.0', Got: '8.0.0.0'
Load from: 'C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.11\ref\net8.0\System.Diagnostics.FileVersionInfo.dll'
------------------
Resolve: 'System.Linq, Version=6.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
Found single assembly: 'System.Linq, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
WARN: Version mismatch. Expected: '6.0.0.0', Got: '8.0.0.0'
Load from: 'C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.11\ref\net8.0\System.Linq.dll'
------------------
Resolve: 'Microsoft.AspNetCore.Http.Features, Version=2.2.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
Found single assembly: 'Microsoft.AspNetCore.Http.Features, Version=2.2.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
Load from: 'C:\Users\sstubler\.nuget\packages\microsoft.aspnetcore.http.features\2.2.0\lib\netstandard2.0\Microsoft.AspNetCore.Http.Features.dll'
------------------
Resolve: 'Microsoft.Extensions.Primitives, Version=8.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
Found single assembly: 'Microsoft.Extensions.Primitives, Version=9.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
WARN: Version mismatch. Expected: '8.0.0.0', Got: '9.0.0.0'
Load from: 'C:\Users\sstubler\.nuget\packages\microsoft.extensions.primitives\9.0.0\lib\net8.0\Microsoft.Extensions.Primitives.dll'
------------------
Resolve: 'System.IdentityModel.Tokens.Jwt, Version=8.0.1.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35'
Found single assembly: 'System.IdentityModel.Tokens.Jwt, Version=8.0.1.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35'
Load from: 'C:\Users\sstubler\.nuget\packages\system.identitymodel.tokens.jwt\8.0.1\lib\net8.0\System.IdentityModel.Tokens.Jwt.dll'
------------------
Resolve: 'System.Runtime, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
Found single assembly: 'System.Runtime, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
Load from: 'C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.11\ref\net8.0\System.Runtime.dll'
------------------
Resolve: 'System.Runtime.InteropServices, Version=6.0.0.0, Culture=neutral, PublicKeyToken=null'
Found single assembly: 'System.Runtime.InteropServices, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
WARN: Version mismatch. Expected: '6.0.0.0', Got: '8.0.0.0'
Load from: 'C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.11\ref\net8.0\System.Runtime.InteropServices.dll'
------------------
Resolve: 'System.Runtime.CompilerServices.Unsafe, Version=6.0.0.0, Culture=neutral, PublicKeyToken=null'
Found single assembly: 'System.Runtime.CompilerServices.Unsafe, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
WARN: Version mismatch. Expected: '6.0.0.0', Got: '8.0.0.0'
Load from: 'C:\Program Files\dotnet\packs\Microsoft.NETCore.App.Ref\8.0.11\ref\net8.0\System.Runtime.CompilerServices.Unsafe.dll'
#endif

}
