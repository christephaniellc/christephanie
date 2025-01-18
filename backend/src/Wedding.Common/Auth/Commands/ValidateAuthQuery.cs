using Wedding.Common.Dispatchers;

namespace Wedding.Common.Auth.Commands
{
    public record ValidateAuthQuery(
        string JwtAuthority,
        string JwtAudience,
        string MethodArn,
        string? Token = null) : IWeddingQuery;
}
