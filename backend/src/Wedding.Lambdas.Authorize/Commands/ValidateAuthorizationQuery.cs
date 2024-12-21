using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Authorize.Commands
{
    public record ValidateAuthorizationQuery(
        string Token, 
        string MethodArn) : IWeddingQuery;
}
