using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Amazon.DynamoDBv2.Model;
using Amazon.DynamoDBv2;
using AutoMapper;
using FluentAssertions;
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

namespace Wedding.Lambdas.UnitTests.Authorize
{
    [UnitTestsFor(typeof(Auth0Provider))]
    [TestFixture]
    public class Auth0ProviderTests
    {
        private IMapper _mapper;
        private Auth0Provider _auth0Provider;

        private const string Authority = "api.wedding.christephanie.com";
        private const string Audience = "test";
        private const string ClientId = "clientid";
        private const string ClientSecret = "clientsecret";
        private const string DynamoTableName = "TestTable";
        private const string DynamoTableIdentityCol = "IdentityId";
        private const string DynamoTableIdentityIndex = "IdentityIndex";

        [SetUp]
        public void Setup()
        {
            var config = new MapperConfiguration(
                cfg => cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles()));
            _mapper = config.CreateMapper();

            _auth0Provider = new Auth0Provider(
                _mapper,
                Authority,
                Audience);
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

        private string GenerateTestJwtToken(RoleEnum role)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecretKeyHereOsdiojo9jowijefoisjdlkfJLSDKjfoisjO")); 
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);


            var header = new JwtHeader(credentials);
            var payload = new JwtPayload
            {
                { "sub", "Auth0|12345" },
                { "name", "John Doe" },
                { "Roles", new[] { role.ToString() } }
            };

            var token = new JwtSecurityToken(header, payload);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [Test]
        public async Task IsAuthorized_AuthenticateToken()
        {
            // Arrange
            var token = GenerateTestJwtToken(RoleEnum.Admin);
            var methodArn = "arn:aws:execute-api:region:account-id:api-id/stage/method/resource";
            var userId = "Auth0|12345";
            var invitationCode = "ABCDE";

            var dynamoResponse = new QueryResponse
            {
                Items = new List<Dictionary<string, AttributeValue>>
                {
                    new Dictionary<string, AttributeValue>
                    {
                        {"Roles", new AttributeValue {SS = new List<string> { RoleEnum.Admin.ToString() }}}
                    }
                }
            };

            var weddingEntity = new WeddingEntity { Auth0Id = userId };
            var guestDto = new GuestDto { Roles = new List<RoleEnum> { RoleEnum.Admin } };

            MockAmazonDynamoDB(dynamoResponse);
            // _mapper.Setup(m => m.Map<WeddingEntity>(It.IsAny<QueryResponse>())).Returns(weddingEntity);
            // _mapper.Setup(m => m.Map<GuestDto>(weddingEntity)).Returns(guestDto);

            // Act
            var response = JwtClaimHelper.GetGuestIdFromToken(token, Audience);

            // Assert
            response.Should().Be(userId);
        }

        [Test]
        public async Task IsAuthorized_InvalidToken_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var token = "invalid.jwt.token";
            var methodArn = "arn:aws:execute-api:region:account-id:api-id/stage/method/resource";
            var invitationCode = "ABCDE";

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                JwtClaimHelper.GetGuestIdFromToken(token, Audience));
        }
    }
}
