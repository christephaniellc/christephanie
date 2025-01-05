using Amazon.Lambda.APIGatewayEvents;
using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Authorize.Commands;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public class LambdaAuthorizer : ILambdaAuthorizer
    {
        private readonly IAsyncQueryHandler<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse> _authHandler;

        public LambdaAuthorizer(IAsyncQueryHandler<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse> authHandler)
        {
            _authHandler = authHandler;
        }

        public async Task<AuthContext> GetAsync(ValidateAuthQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            var authResult = await _authHandler.GetAsync(query, cancellationToken);

            return new AuthContext
            {
                InvitationCode = authResult.GetInvitationCodeFromAuth(),
                GuestId = authResult.GetGuestIdFromAuth(),
                Roles = string.Join(',', authResult.GetRolesFromAuth())
            };
        }
    }
}
