using Amazon.Lambda.APIGatewayEvents;
using System.Threading.Tasks;
using Wedding.Lambdas.Authorize.Enums;

namespace Wedding.Lambdas.Authorize.Providers
{
    public interface IAuthorizationProvider
    {
        Task<APIGatewayCustomAuthorizerResponse> IsAuthorized(string token, string methodArn);
        APIGatewayCustomAuthorizerResponse GeneratePolicy(PolicyEffectEnum effect, string methodArn, string? userId = null);
    }
}
