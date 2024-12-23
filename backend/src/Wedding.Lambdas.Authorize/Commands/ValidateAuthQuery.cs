using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Authorize.Commands
{
    public record ValidateAuthQuery(
        string Token,
        string JwtAuthority,
        string JwtAudience,
        string MethodArn,
        string? InvitationCode = null,
        string? FirstName = null) : IWeddingQuery;
}
