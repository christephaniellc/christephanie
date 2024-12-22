using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Authorize.Commands
{
    public record ValidateAuthorizationQuery(
        string Token, 
        string MethodArn,
        string InvitationCode,
        string JwtAuthority,
        string JwtAudience) : IWeddingQuery;
}
