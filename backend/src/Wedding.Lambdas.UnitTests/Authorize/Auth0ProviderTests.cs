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
                Authority,
                Audience,
                ClientId,
                ClientSecret,
                _mapper,
                DynamoTableName,
                DynamoTableIdentityCol,
                DynamoTableIdentityIndex);
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
                { "roles", new[] { role.ToString() } }
            };

            var token = new JwtSecurityToken(header, payload);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [Test]
        public async Task IsAuthorized_ValidTokenAndPermission_ReturnsAllowPolicy()
        {
            // Arrange
            var token = GenerateTestJwtToken(RoleEnum.Admin);
            var methodArn = "arn:aws:execute-api:region:account-id:api-id/stage/method/resource";
            var userId = "Auth0|12345";

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
            var response = await _auth0Provider.IsAuthorized(token, methodArn);

            // Assert
            response.PrincipalID.Should().Be(userId);
            response.PolicyDocument.Statement.First().Effect.Should().Be("Allow");
        }

        [Test]
        public async Task IsAuthorized_InvalidToken_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var token = "invalid.jwt.token";
            var methodArn = "arn:aws:execute-api:region:account-id:api-id/stage/method/resource";

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _auth0Provider.IsAuthorized(token, methodArn));
        }

        [Test]
        public void GetIdentity_ValidAuth0Id_ReturnsId()
        {
            // Arrange
            var weddingEntity = new WeddingEntity { Auth0Id = "Auth0|12345" };

            // Act
            var result = _auth0Provider.GetIdentity(weddingEntity);

            // Assert
            result.Should().Be("12345");
        }

        [Test]
        public void SetIdentity_ValidId_SetsAuth0Id()
        {
            // Arrange
            var weddingEntity = new WeddingEntity();
            var id = "12345";

            // Act
            _auth0Provider.SetIdentity(weddingEntity, id);

            // Assert
            weddingEntity.Auth0Id.Should().Be("Auth0|12345");
        }

        [Test]
        public void ShouldGetIdentity()
        {
            var entity = new WeddingEntity
            {
                FirstName = "John",
                LastName = "Hancock",
                Auth0Id = SupportedAuthorizationProvidersEnum.Auth0 + "|298374sjofisf;" 
                        + SupportedAuthorizationProvidersEnum.Internal + "|90wjf9jsfsief;"
                        + SupportedAuthorizationProvidersEnum.NoOpAdmin + "|randomValue;"
                        + SupportedAuthorizationProvidersEnum.NoOpUser + "|oiwefoiwejfo;"
            };

            var result = _auth0Provider.GetIdentity(entity);

            result.Should().Be("298374sjofisf");
        }

        [Test]
        public void ShouldNotGetIdentity()
        {
            var entity = new WeddingEntity
            {
                FirstName = "John",
                LastName = "Hancock",
                Auth0Id = SupportedAuthorizationProvidersEnum.Internal + "|90wjf9jsfsief;"
                        + SupportedAuthorizationProvidersEnum.NoOpAdmin + "|randomValue;"
                        + SupportedAuthorizationProvidersEnum.NoOpUser + "|oiwefoiwejfo;"
            };

            var result = _auth0Provider.GetIdentity(entity);

            result.Should().BeNull();
        }


        [Test]
        public void ShouldSetIdentity()
        {
            var entity = new WeddingEntity
            {
                FirstName = "John",
                LastName = "Hancock",
            };

            _auth0Provider.SetIdentity(entity, "23456");
            var result = _auth0Provider.GetIdentity(entity);

            result.Should().Be("23456");
        }

        [Test]
        public void ShouldUpdateIdentity()
        {
            var entity = new WeddingEntity
            {
                FirstName = "John",
                LastName = "Hancock",
                Auth0Id = SupportedAuthorizationProvidersEnum.Auth0 + "|298374sjofisf;"
                        + SupportedAuthorizationProvidersEnum.Internal + "|90wjf9jsfsief;"
                        + SupportedAuthorizationProvidersEnum.NoOpAdmin + "|randomValue;"
                        + SupportedAuthorizationProvidersEnum.NoOpUser + "|oiwefoiwejfo;"
            };

            _auth0Provider.SetIdentity(entity, "23456");
            var result = _auth0Provider.GetIdentity(entity);

            result.Should().Be("23456");
        }
    }
}
