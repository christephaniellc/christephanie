using Amazon.Lambda.APIGatewayEvents;
using System.Collections.Generic;
using System.Threading.Tasks;
using Wedding.Abstractions.Enums;
using Wedding.Lambdas.Authorize.Enums;

namespace Wedding.Lambdas.Authorize.Providers
{
    public interface IAuthorizationProvider
    {
        Task<APIGatewayCustomAuthorizerResponse> IsAuthorized(string token, string methodArn);
        APIGatewayCustomAuthorizerResponse GeneratePolicy(PolicyEffectEnum effect, string methodArn, string? userId = null, List<RoleEnum>? roles = null);
    }
}
