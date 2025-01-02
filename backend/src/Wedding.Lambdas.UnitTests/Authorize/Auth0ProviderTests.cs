using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Amazon.DynamoDBv2.Model;
using Amazon.DynamoDBv2;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Authorize.Providers;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.JwtClaim;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Authorize
{
    [UnitTestsFor(typeof(Auth0Provider))]
    [TestFixture]
    public class Auth0ProviderTests
    {
        private IMapper _mapper;
        private Auth0Provider _auth0Provider;
        private TestTokenHelper _testTokenHelper;

        [SetUp]
        public void Setup()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);

            var config = new MapperConfiguration(
                cfg => cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles()));
            _mapper = config.CreateMapper();

            _auth0Provider = new Auth0Provider();
        }

        private void MockAmazonDynamoDB(QueryResponse response)
        {
            var amazonDynamoDBMock = new Mock<IAmazonDynamoDB>();
            amazonDynamoDBMock
                .Setup(client => client.QueryAsync(It.IsAny<QueryRequest>(), default))
                .ReturnsAsync(response);

            // Replace actual DynamoDB client instantiation
            AmazonDynamoDBClient client = new AmazonDynamoDBClient();
        }

        // private string GenerateTestJwtToken(RoleEnum role)
        // {
        //     var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecretKeyHereOsdiojo9jowijefoisjdlkfJLSDKjfoisjO")); 
        //     var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        //
        //
        //     var header = new JwtHeader(credentials);
        //     var payload = new JwtPayload
        //     {
        //         { "sub", "Auth0|12345" },
        //         { "name", "John Doe" },
        //         { "UserRoles", new[] { role.ToString() } }
        //     };
        //
        //     var token = new JwtSecurityToken(header, payload);
        //     return new JwtSecurityTokenHandler().WriteToken(token);
        // }

        [Test]
        public async Task IsAuthorized_AuthenticateToken()
        {
            // Arrange
            var token = await _testTokenHelper.GenerateAuth0Token(TestDataHelper.GUEST_JOHN.GuestId);
            // var methodArn = LambdaArns.FamilyUnitGet;
            // var userId = "Auth0|12345";
            // var invitationCode = "ABCDE";
            //
            // var dynamoResponse = new QueryResponse
            // {
            //     Items = new List<Dictionary<string, AttributeValue>>
            //     {
            //         new Dictionary<string, AttributeValue>
            //         {
            //             {"UserRoles", new AttributeValue {SS = new List<string> { RoleEnum.Admin.ToString() }}}
            //         }
            //     }
            // };
            //
            //MockAmazonDynamoDB(dynamoResponse);

            // Act
            var response = JwtClaimHelper.GetGuestIdFromToken(token, _testTokenHelper.JwtAudience);

            // Assert
            response.Should().Be(TestDataHelper.GUEST_JOHN.GuestId);
        }

        [Test]
        public async Task IsAuthorized_InvalidToken_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var token = "invalid.jwt.token";
            // var methodArn = "arn:aws:execute-api:region:account-id:api-id/stage/method/resource";
            // var invitationCode = "ABCDE";

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                JwtClaimHelper.GetGuestIdFromToken(token, _testTokenHelper.JwtAudience));
        }
    }
}
