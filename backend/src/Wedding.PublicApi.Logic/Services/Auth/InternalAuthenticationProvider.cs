using Amazon.DynamoDBv2.DataModel;
using System;
using System.Threading.Tasks;
using Wedding.Abstractions.Dtos.Auth0;
using Wedding.Lambdas.Authorize.Providers;

namespace Wedding.PublicApi.Logic.Services.Auth
{
    public class InternalAuthenticationProvider : IAuthenticationProvider
    {
        private readonly IDynamoDBContext _repository;

        public InternalAuthenticationProvider(IDynamoDBContext repository)
        {
            _repository = repository;
        }

        public string GetAudience()
        {
            throw new NotImplementedException();
        }

        public Task<Auth0User> GetUserInfo(string token)
        {
            throw new NotImplementedException();
        }
    }
}
