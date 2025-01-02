using System;
using System.Threading.Tasks;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Authorize.Providers;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public class InternalAuthenticationProvider : IAuthenticationProvider
    {
        private readonly IDynamoDBProvider _dynamoDBProvider;

        public InternalAuthenticationProvider(IDynamoDBProvider dynamoDBProvider)
        {
            _dynamoDBProvider = dynamoDBProvider;
        }

        public Task<string> GetAudience()
        {
            throw new NotImplementedException();
        }

        public Task<Auth0User> GetUserInfo(string token)
        {
            throw new NotImplementedException();
        }
    }
}
