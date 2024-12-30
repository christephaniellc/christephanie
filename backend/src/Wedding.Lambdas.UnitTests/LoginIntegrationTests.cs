using System.IdentityModel.Tokens.Jwt;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.TestUtilities;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using NUnit.Framework;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.User.Find.Commands;
using Wedding.Lambdas.User.Find.Handlers;
using Wedding.Abstractions.Mapping;
using Wedding.Abstractions.Keys;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Handlers;
using Wedding.Lambdas.Authorize.Providers;
using Microsoft.Extensions.Configuration;
using Wedding.Common.Configuration;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using Amazon.DynamoDBv2.DocumentModel;
using Wedding.Abstractions.Dtos.Auth0;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.FamilyUnit.Get.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests
{
    [TestFixture]
    public class LoginIntegrationTests
    {
        private Wedding.Lambdas.User.Find.Function _userFindFunction;
        private Wedding.Lambdas.Authorize.Function _authFunction;
        private Wedding.Lambdas.FamilyUnit.Get.Function _familyUnitGetFunction;

        private Mock<ILambdaContext> _mockLambdaContext;
        private IMapper _mapper;
        private FindUserHandler _findUserHandler;
        private AuthHandler _authHandler;
        private GetFamilyUnitHandler _getFamilyUnitHandler;

        private string _johnAuth0Id = "auth0|12345";

        private string _jwtAuthority;
        private string _jwtAudience;
        private string _clientId;
        private string _clientSecret;
        private string _tokenEndpoint;

        private async Task<string> GenerateAuth0Token(string? guestId = null)
        {
            var requestBody = new
            {
                client_id = _clientId,
                client_secret = _clientSecret,
                audience = _jwtAudience,
                grant_type = "client_credentials"
            };
            var requestBodyGuest = new
            {
                client_id = _clientId,
                client_secret = _clientSecret,
                audience = _jwtAudience,
                grant_type = "client_credentials",
                guest_id = guestId!
            };

            StringContent content;
            if (string.IsNullOrEmpty(guestId))
            {
                content = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json");
            }
            else
            {
                content = new StringContent(
                    JsonSerializer.Serialize(requestBodyGuest),
                    Encoding.UTF8,
                    "application/json");
            }

            using (var httpClient = new HttpClient())
            {
                var response = await httpClient.PostAsync(_tokenEndpoint, content);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();
                var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(responseBody);

                return tokenResponse.access_token;
            }
        }

        public class TokenResponse
        {
            [JsonPropertyName("access_token")]
            public string access_token { get; set; }
            [JsonPropertyName("expires_in")]
            public int expires_in { get; set; }
            [JsonPropertyName("token_type")]
            public string token_type { get; set; }
        }

        public string GenerateTestToken(string? guestId = null)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("awwefdvxdae4tw3trdegdrhsefawrq4terdhdrt4tetrdtftyjdrtawerqrsrghcghmghweaasrdkhjknklg"));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, "auth0|user-id"),
                new Claim(JwtRegisteredClaimNames.Email, "john.doe@example.com"),
                new Claim("permissions", "read:guests"),
                new Claim("permissions", "write:guests")
            };
            if (!string.IsNullOrEmpty(guestId))
            {
                claims.Add(new Claim(_jwtAudience + "/guest_id", guestId));
            }

            var token = new JwtSecurityToken(
                issuer: _jwtAuthority,
                audience: _jwtAudience,
                claims: claims.ToArray(),
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public void SetUpHandlers(Mock<IDynamoDBContext> repository, ServiceCollection serviceCollection)
        {
            var mockAuthenticationProvider = new Mock<IAuthenticationProvider>();
            mockAuthenticationProvider
                .Setup(provider => provider.GetUserInfo(It.IsAny<string>()))
                .ReturnsAsync((string token) =>
                {
                    // if (token == "valid-token")
                    // {
                    return new Auth0User
                    {
                        UserId = _johnAuth0Id,
                        Name = TestDataHelper.GUEST_JOHN.FirstName,
                        Email = "johndoe@example.com",
                        EmailVerified = true,
                        InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode
                    };
                    // }
                    // else
                    // {
                    //     return null;
                    // }
                });
            mockAuthenticationProvider
                .Setup(provider => provider.GetAudience())
                .Returns(_jwtAudience);
            var authProvider = new DatabaseRoleProvider(_mapper, repository.Object, mockAuthenticationProvider.Object);

            _findUserHandler = new FindUserHandler(Mock.Of<ILogger<FindUserHandler>>(), repository.Object, _mapper);
            _authHandler = new AuthHandler(Mock.Of<ILogger<AuthHandler>>(), repository.Object, _mapper, authProvider);
            _getFamilyUnitHandler = new GetFamilyUnitHandler(Mock.Of<ILogger<GetFamilyUnitHandler>>(), repository.Object, _mapper);

            serviceCollection.AddScoped(_ => _findUserHandler);
            serviceCollection.AddScoped(_ => _authHandler);
            serviceCollection.AddScoped(_ => _getFamilyUnitHandler);
        }
        
        public void SetUpRepository(Mock<IDynamoDBContext> repository)
        {
            var familySearchResult = new List<WeddingEntity>
            {
                _mapper.Map<WeddingEntity>(TestDataHelper.TEST_INVITATION_CODE),
                _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN),
                _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE)
            };

            var mockAsyncSearch = new Mock<AsyncSearch<WeddingEntity>>(MockBehavior.Strict);
            mockAsyncSearch.Setup(x => x.GetRemainingAsync(default))
                .ReturnsAsync(familySearchResult);

            var partitionKey = DynamoKeys.GetFamilyUnitPartitionKey(TestDataHelper.TEST_INVITATION_CODE);
            repository.Setup(x => x.QueryAsync<WeddingEntity>(partitionKey, It.IsAny<DynamoDBOperationConfig>()))
                .Returns(mockAsyncSearch.Object);

            var familyUnitSortKey = DynamoKeys.GetFamilyInfoSortKey();
            repository.Setup(x => x.LoadAsync<WeddingEntity>(partitionKey, familyUnitSortKey, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            repository.Setup(x => x.LoadAsync<WeddingEntity>(TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<DynamoDBOperationConfig>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));

            // var mockFamilyAsyncSearch = new Mock<AsyncSearch<WeddingEntity>>(MockBehavior.Strict);
            // repository.Setup(x => x.FromQueryAsync<WeddingEntity>(It.IsAny<QueryOperationConfig>(), It.IsAny<DynamoDBOperationConfig>()))
            //     .Returns(familySearchResult);

            // repository
            //     .Setup(repo => repo.FromQueryAsync<WeddingEntity>(It.IsAny<QueryOperationConfig>(), It.IsAny<DynamoDBOperationConfig>()))
            //     .Returns(new MockDynamoQuery<WeddingEntity>(familySearchResult));

            repository.Setup(x => x.FromQueryAsync<WeddingEntity>(It.IsAny<QueryOperationConfig>(), It.IsAny<DynamoDBOperationConfig>()))
                .Returns(mockAsyncSearch.Object);

            // repository
            //     .Setup(repo => repo.FromQueryAsync<WeddingEntity>(It.IsAny<QueryOperationConfig>(), It.IsAny<DynamoDBOperationConfig>()))
            //     .ReturnsAsync(mockAsyncSearch);

            // var dynamoQuery = new QueryOperationConfig()
            // {
            //     KeyExpression = new Expression
            //     {
            //         ExpressionStatement = "PartitionKey = :pk",
            //         ExpressionAttributeValues =
            //         {
            //             { ":pk", partitionKey },
            //         }
            //     }
            // };
            //
            // var results = await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery).GetRemainingAsync();
        }

        public void SetUpFunctions(ServiceCollection serviceCollection)
        {
            var serviceProvider = serviceCollection.BuildServiceProvider();

            _userFindFunction = new Wedding.Lambdas.User.Find.Function(serviceProvider);
            _authFunction = new Wedding.Lambdas.Authorize.Function(serviceProvider, _jwtAuthority, _jwtAudience);
            _familyUnitGetFunction = new Wedding.Lambdas.FamilyUnit.Get.Function(serviceProvider);
        }

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _jwtAuthority = configuration[ConfigurationKeys.AuthenticationAuthority];
            _jwtAudience = configuration[ConfigurationKeys.AuthenticationAudience];
            _clientId = configuration[ConfigurationKeys.AuthenticationClientId];
            _clientSecret = configuration[ConfigurationKeys.AuthenticationClientSecret];
            _tokenEndpoint = _jwtAuthority + "/oauth/token";

            var config = new MapperConfiguration(cfg =>
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles()));
            _mapper = config.CreateMapper();

            _mockLambdaContext = new Mock<ILambdaContext>();
            _mockLambdaContext.Setup(x => x.Logger).Returns(new Mock<ILambdaLogger>().Object);

            var serviceCollection = new ServiceCollection();
            var repository = new Mock<IDynamoDBContext>();

            SetUpRepository(repository);
            SetUpHandlers(repository, serviceCollection);
            SetUpFunctions(serviceCollection);
        }

        [TestCase(false)]
        [TestCase(true)]
        public async Task ShouldLogin(bool tokenWithGuestId)
        {
            // Step 1. Find user first by invitation code and first name
            var context = new TestLambdaContext();
            var command = new FindUserQuery(TestDataHelper.TEST_INVITATION_CODE, "John");
            var request = new APIGatewayProxyRequest
            {
                QueryStringParameters = QueryStringHelper.ConvertToQueryStringParameters(command)
            };

            var response = await _userFindFunction.FunctionHandler(request, context);
            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
            response.Headers["Content-Type"].Should().Be("application/json");

            var actualResult = JsonSerializer.Deserialize<string>(response.Body);
            actualResult.Should().Be(TestDataHelper.GUEST_JOHN.GuestId);

            // Step 2. Authorize user by token and guest ID 
            var token = await GenerateAuth0Token(tokenWithGuestId ? TestDataHelper.GUEST_JOHN.GuestId : null);

            var authRequest = new APIGatewayCustomAuthorizerRequest
            {
                AuthorizationToken = token,
                MethodArn = LambdaArns.Auth
            };
            var authResponse = await _authFunction.FunctionHandler(authRequest, context);

            if (!tokenWithGuestId)
            {
                authResponse.Should().NotBeNull();
                authResponse.PrincipalID.Should().Be("unknown");
                authResponse.PolicyDocument.Statement.FirstOrDefault().Effect.Should().Be(PolicyEffectEnum.Deny.ToString());
                authResponse.Context.Should().Contain(x => x.Key == "error" && x.Value == "Invalid token");
            }
            else
            {
                authResponse.Should().NotBeNull();
                authResponse.PrincipalID.Should().Be(_johnAuth0Id);
                authResponse.PolicyDocument.Statement.FirstOrDefault().Effect.Should().Be(PolicyEffectEnum.Allow.ToString());
                authResponse.PolicyDocument.Statement.FirstOrDefault().Resource.FirstOrDefault().Should().Be(LambdaArns.Auth);
                authResponse.PolicyDocument.Statement.FirstOrDefault().Action.FirstOrDefault().Should().Be("execute-api:Invoke");
                authResponse.Context.Should().Contain(x => x.Key == "token" && x.Value == token);
                authResponse.Context.Should().Contain(x => x.Key == "guestId" && x.Value == TestDataHelper.GUEST_JOHN.GuestId);
                authResponse.Context.Should().Contain(x => x.Key == "roles" && x.Value == RoleEnum.Guest.ToString());
                authResponse.Context.Should().Contain(x => x.Key == "invitationCode" && x.Value == TestDataHelper.GUEST_JOHN.InvitationCode);

                // Step 3. Get family unit DTO using auth context
                var familyUnitRequest = new APIGatewayProxyRequest
                {
                    RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
                    {
                        Authorizer = authResponse.Context.ConvertToCustomAuthorizerContext()
                    }
                };
                var familyUnitGetResponse = await _familyUnitGetFunction.FunctionHandler(familyUnitRequest, context);
                var familyUnit = APIGatewayProxyResponseHelper.GetResponseBody<FamilyUnitDto>(familyUnitGetResponse);

                familyUnitGetResponse.Should().NotBeNull();
                familyUnit.Guests.Count.Should().Be(2);
                familyUnit.InvitationCode.Should().Be(TestDataHelper.TEST_INVITATION_CODE);
            }
        }

        [Test]
        public async Task FunctionHandler_ReturnsOkResponse_OnSuccessJohn()
        {
            // Arrange
            var request = new APIGatewayProxyRequest
            {
                QueryStringParameters = new Dictionary<string, string>
                {
                    { "InvitationCode", "ABAAB" },
                    { "firstName", "John" }
                }
            };

            // Act
            var response = await _userFindFunction.FunctionHandler(request, _mockLambdaContext.Object);

            // Assert
            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
            response.Headers["Content-Type"].Should().Be("application/json");

            var actualResult = JsonSerializer.Deserialize<string>(response.Body);
            actualResult.Should().Be(TestDataHelper.GUEST_JOHN.GuestId);
        }

        [Test]
        public async Task FunctionHandler_ReturnsOkResponse_OnSuccessJane()
        {
            // Arrange
            var request = new APIGatewayProxyRequest
            {
                QueryStringParameters = new Dictionary<string, string>
                {
                    { "InvitationCode", TestDataHelper.TEST_INVITATION_CODE },
                    { "firstName", "Jane" }
                }
            };

            // Act
            var response = await _userFindFunction.FunctionHandler(request, _mockLambdaContext.Object);

            // Assert
            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
            response.Headers["Content-Type"].Should().Be("application/json");

            var actualResult = JsonSerializer.Deserialize<string>(response.Body);
            actualResult.Should().Be(TestDataHelper.GUEST_JANE.GuestId);
        }

        // [Test]
        // public async Task FunctionHandler_ReturnsUnauthorized_OnUnauthorizedAccessException()
        // {
        //     // Arrange
        //     var request = new APIGatewayProxyRequest();
        //     _mockHandler.Setup(x => x.GetAsync(It.IsAny<FindUserQuery>(), It.IsAny<CancellationToken>()))
        //         .ThrowsAsync(new UnauthorizedAccessException("Not authorized"));
        //
        //     // Act
        //     var response = await _userFindFunction.FunctionHandler(request, _mockLambdaContext.Object);
        //
        //     // Assert
        //     Assert.AreEqual((int)HttpStatusCode.Unauthorized, response.StatusCode);
        //     Assert.AreEqual("application/json", response.Headers["Content-Type"]);
        //     StringAssert.Contains("Authorization exception", response.Body);
        // }
        //
        // [Test]
        // public async Task FunctionHandler_ReturnsBadRequest_OnValidationException()
        // {
        //     // Arrange
        //     var request = new APIGatewayProxyRequest();
        //     _mockHandler.Setup(x => x.GetAsync(It.IsAny<FindUserQuery>(), It.IsAny<CancellationToken>()))
        //         .ThrowsAsync(new ValidationException("Invalid input"));
        //
        //     // Act
        //     var response = await _userFindFunction.FunctionHandler(request, _mockLambdaContext.Object);
        //
        //     // Assert
        //     Assert.AreEqual((int)HttpStatusCode.BadRequest, response.StatusCode);
        //     Assert.AreEqual("application/json", response.Headers["Content-Type"]);
        //     StringAssert.Contains("Validation exception", response.Body);
        // }
        //
        // [Test]
        // public async Task FunctionHandler_ReturnsInternalServerError_OnException()
        // {
        //     // Arrange
        //     var request = new APIGatewayProxyRequest();
        //     _mockHandler.Setup(x => x.GetAsync(It.IsAny<FindUserQuery>(), It.IsAny<CancellationToken>()))
        //         .ThrowsAsync(new Exception("Unexpected error"));
        //
        //     // Act
        //     var response = await _userFindFunction.FunctionHandler(request, _mockLambdaContext.Object);
        //
        //     // Assert
        //     Assert.AreEqual((int)HttpStatusCode.InternalServerError, response.StatusCode);
        //     Assert.AreEqual("application/json", response.Headers["Content-Type"]);
        //     StringAssert.Contains("Error occurred", response.Body);
        // }
    }
}
