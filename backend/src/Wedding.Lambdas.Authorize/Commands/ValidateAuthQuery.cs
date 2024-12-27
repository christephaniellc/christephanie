using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Authorize.Commands
{
    public record ValidateAuthQuery(
        string JwtAuthority,
        string JwtAudience,
        string MethodArn,
        string? Token = null) : IWeddingQuery;
}
