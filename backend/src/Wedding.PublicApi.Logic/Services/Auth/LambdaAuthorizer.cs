using Amazon.Lambda.APIGatewayEvents;
using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Abstractions;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Helpers.AWS;

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
                Audience = authResult.GetAudienceFromAuth(),
                InvitationCode = authResult.GetInvitationCodeFromAuth(),
                GuestId = authResult.GetGuestIdFromAuth(),
                Name = authResult.GetNameFromAuth(),
                Roles = string.Join(',', authResult.GetRolesFromAuth()),
                IpAddress = authResult.GetIpAddressFromAuth()
            };
        }
    }
}
