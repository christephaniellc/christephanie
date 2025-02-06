using Wedding.Common.Dispatchers;

namespace Wedding.Common.Auth.Commands
{
    public record ValidateAuthQuery(
        string JwtAuthority,
        string JwtAudience,
        string MethodArn,
        string IpAddress,
        string? Token = null) : IWeddingQuery;
}
