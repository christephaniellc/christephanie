using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.Extensions.Configuration;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Serialization;

namespace Wedding.Lambdas.UnitTests.TestData
{
    public static class TestRequestHelper
    {
        public static APIGatewayProxyRequest RequestAsJohn<T>(T request)
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            var testTokenHelper = new TestTokenHelper(configuration);

            var fakeAuthContext = new AuthContext
            {
                Audience = testTokenHelper!.JwtAudience,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles),
                IpAddress = "127.0.0.1"
            };

            return new APIGatewayProxyRequest
            {
                RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
                {
                    Authorizer = new APIGatewayCustomAuthorizerContext
                    {
                        ["lambda"] = JsonSerializer.Serialize(fakeAuthContext)
                    }
                },
                Body = JsonSerializer.Serialize(request, JsonSerializationHelper.FromFrontendOptions)
            };
        }
    }
}
