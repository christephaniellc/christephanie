using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Auth;
using Wedding.Common.Auth.Commands;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Providers;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public class NoOpAuthenticationProvider : IAuthenticationProvider, IAuthorizationProvider
    {
        private readonly bool _isAdmin;

        public NoOpAuthenticationProvider(bool isAdmin)
        {
            _isAdmin = isAdmin;
        }

        // public Task<Auth0User> Authenticate(string token)
        // {
        //     return Task.FromResult(new Auth0User
        //     {
        //         UserId = "google-oauth2|107168580436857475897",
        //         Name = "Stephanie",
        //         Nickname = "steph.stubler",
        //         GivenName = "Stephanie",
        //         FamilyName = "Stubler",
        //         Email = "steph.stubler@gmail.com",
        //         EmailVerified = true,
        //         Picture = "https://lh3.googleusercontent.com/a/ACg8ocKlYzLC2W_9L7JFUlFw70pIrJygt9pEaNmRmxG_7lhCq-6lj8wo=s96-c",
        //         UserMetadata = null,
        //         AppMetadata = null
        //     });
        // }
        //
        // public Task<Auth0User> Authorize(Auth0User authenticatedUser, string methodArn)
        // {
        //     if (_isAdmin)
        //     {
        //         authenticatedUser.CurrentUserRoles.Add(RoleEnum.Admin);
        //         return Task.FromResult(authenticatedUser);
        //     }
        //
        //     authenticatedUser.CurrentUserRoles.Add(RoleEnum.Guest);
        //     return Task.FromResult(authenticatedUser);
        //}

        public Task<string> GetAudience()
        {
            throw new System.NotImplementedException();
        }

        public Task<Auth0User> GetUserInfo(string token)
        {
            throw new System.NotImplementedException();
        }

        public Task<GuestDto?> Authorize(ValidateAuthQuery query)
        {
            throw new System.NotImplementedException();
        }
    }
}
