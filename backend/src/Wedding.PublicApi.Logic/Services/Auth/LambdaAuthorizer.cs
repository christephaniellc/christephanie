using System;
using System.Collections.Generic;
using Amazon.Lambda.APIGatewayEvents;
using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
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
            if (authResult == null)
            {
                throw new UnauthorizedAccessException("Unable to determine authorization context.");
            }

            return new AuthContext
            {
                Audience = authResult.GetAudienceFromAuth() ?? "unknown",
                InvitationCode = authResult.GetInvitationCodeFromAuth() ?? "unknown",
                GuestId = authResult.GetGuestIdFromAuth() ?? "unknown",
                Name = authResult.GetNameFromAuth() ?? "unknown",
                Roles = string.Join(',', authResult.GetRolesFromAuth() ?? new List<RoleEnum>()) ?? "unknown",
                IpAddress = authResult.GetIpAddressFromAuth() ?? "unknown"
            };
        }
    }
}
