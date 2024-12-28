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
using Wedding.Abstractions.Dtos.Auth0;

namespace Wedding.Lambdas.UnitTests
{
    [TestFixture]
    public class LoginIntegrationTests
    {
        private IConfiguration _configuration;

        private Wedding.Lambdas.User.Find.Function _userFindFunction;
        private Wedding.Lambdas.Authorize.Function _authFunction;

        private Mock<ILambdaContext> _mockLambdaContext;
        private IMapper _mapper;
        private FindUserHandler _findUserHandler;
        private AuthHandler _authHandler;

        private string _invitationCode = "ABAAB";
        private string _johnAuth0Id = "auth0|12345";
        private GuestDto _john;
        private GuestDto _jane;

        private string _jwtAuthority;
        private string _jwtAudience;
        private string _clientId;
        private string _clientSecret;
        private string _tokenEndpoint;

        private async Task<string> GenerateToken(string? guestId = null)
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

        [SetUp]
        public void SetUp()
        {
            // _configuration = new ConfigurationBuilder()
            //     .SetBasePath(AppContext.BaseDirectory) // Ensures the correct path for the JSON file
            //     .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
            //     .Build();

            // Load configuration from appsettings.Development.json
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
            //var authProvider = new Mock<IAuthorizationProvider>();
            var authenticationProvider = new Auth0Provider(_mapper, _jwtAuthority, _jwtAudience);

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
                            Name = _john.FirstName,
                            Email = "johndoe@example.com",
                            EmailVerified = true,
                            InvitationCode = _john.RsvpCode
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

            _john = new GuestDto
            {
                RsvpCode = _invitationCode,
                GuestId = new Guid("73340000-0000-0000-0000-000000000001").ToString(),
                GuestNumber = 1,
                FirstName = "John",
                AdditionalFirstNames = new List<string> { "Jacob" },
                LastName = "Smith",
                Roles = new List<RoleEnum> { RoleEnum.Guest },
                EmailVerified = false
            };

            _jane = new GuestDto
            {
                RsvpCode = _invitationCode,
                GuestId = new Guid("73340000-0000-0000-0000-000000000002").ToString(),
                GuestNumber = 2,
                FirstName = "Jane",
                LastName = "Smith",
                Roles = new List<RoleEnum> { RoleEnum.Guest, RoleEnum.Party },
                EmailVerified = false
            };
            var familyUnit = new FamilyUnitDto
            {
                RsvpCode = _invitationCode,
                UnitName = "Smiths",
                Guests = new List<GuestDto>
                {
                    _john,
                    _jane
                }
            };

            var mockAsyncSearch = new Mock<AsyncSearch<WeddingEntity>>(MockBehavior.Strict);
            mockAsyncSearch.Setup(x => x.GetRemainingAsync(default))
                .ReturnsAsync(new List<WeddingEntity>
                {
                    _mapper.Map<WeddingEntity>(familyUnit),
                    _mapper.Map<WeddingEntity>(_john),
                    _mapper.Map<WeddingEntity>(_jane)
                });

            var partitionKey = DynamoKeys.GetFamilyUnitPartitionKey(_invitationCode);
            repository.Setup(x => x.QueryAsync<WeddingEntity>(partitionKey, It.IsAny<DynamoDBOperationConfig>()))
                .Returns(mockAsyncSearch.Object);


            // var mockGetUser = new Mock<AsyncSearch<WeddingEntity>>(MockBehavior.Strict);
            // mockGetUser.Setup(x => x.GetRemainingAsync(default))
            //     .ReturnsAsync(new List<WeddingEntity>
            //     {
            //         _mapper.Map<WeddingEntity>(_john)
            //     });
            // repository.Setup(x => x.QueryAsync<WeddingEntity>(It.IsAny<string>(), It.IsAny<DynamoDBOperationConfig>()))
            //     .Returns(mockGetUser.Object);

            var familyUnitSortKey = DynamoKeys.GetFamilyInfoSortKey();
            repository.Setup(x => x.LoadAsync<WeddingEntity>(partitionKey, familyUnitSortKey, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(familyUnit));
            repository.Setup(x => x.LoadAsync<WeddingEntity>(_john.GuestId, It.IsAny<DynamoDBOperationConfig>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(_john));

            _findUserHandler = new FindUserHandler(Mock.Of<ILogger<FindUserHandler>>(), repository.Object, _mapper);
            _authHandler = new AuthHandler(Mock.Of<ILogger<AuthHandler>>(), repository.Object, _mapper, authProvider);

            serviceCollection.AddScoped(_ => _findUserHandler);
            serviceCollection.AddScoped(_ => _authHandler);

            var serviceProvider = serviceCollection.BuildServiceProvider();
            _userFindFunction = new Wedding.Lambdas.User.Find.Function(serviceProvider);
            _authFunction = new Wedding.Lambdas.Authorize.Function(serviceProvider, _jwtAuthority, _jwtAudience);
        }

        [TestCase(false)]
        [TestCase(true)]
        public async Task ShouldLogin(bool tokenWithGuestId)
        {
            // Find user first by invitation code and first name
            var context = new TestLambdaContext();
            var command = new FindUserQuery(_invitationCode, "John");
            var request = new APIGatewayProxyRequest
            {
                QueryStringParameters = QueryStringHelper.ConvertToQueryStringParameters(command)
            };

            var response = await _userFindFunction.FunctionHandler(request, context);
            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
            response.Headers["Content-Type"].Should().Be("application/json");

            var actualResult = JsonSerializer.Deserialize<string>(response.Body);
            actualResult.Should().Be(_john.GuestId);

            // Authorize user by token and guest ID 
            var token = await GenerateToken(tokenWithGuestId ? _john.GuestId : null);
   //         var authRequest = new ValidateAuthQuery(_jwtAuthority, _jwtAudience, LambdaArns.Auth, token);
            //var authorizer = new APIGatewayCustomAuthorizerRequest(); call by function?

            var authRequest = new APIGatewayCustomAuthorizerRequest
            {
                AuthorizationToken = token,
                MethodArn = LambdaArns.Auth
            };
            var authResponse = await _authFunction.FunctionHandler(authRequest, context);

   //         var authResponse = await _authHandler.GetAsync(authRequest);
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
                authResponse.Context.Should().Contain(x => x.Key == "guestId" && x.Value == _john.GuestId);
                authResponse.Context.Should().Contain(x => x.Key == "roles" && x.Value == RoleEnum.Guest.ToString());
                authResponse.Context.Should().Contain(x => x.Key == "invitationCode" && x.Value == _john.RsvpCode);
            }

            // TODO: Use Authorize response to get family DTO
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
            actualResult.Should().Be(_john.GuestId);
        }

        [Test]
        public async Task FunctionHandler_ReturnsOkResponse_OnSuccessJane()
        {
            // Arrange
            var request = new APIGatewayProxyRequest
            {
                QueryStringParameters = new Dictionary<string, string>
                {
                    { "InvitationCode", _invitationCode },
                    { "firstName", "Jane" }
                }
            };

            // Act
            var response = await _userFindFunction.FunctionHandler(request, _mockLambdaContext.Object);

            // Assert
            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
            response.Headers["Content-Type"].Should().Be("application/json");

            var actualResult = JsonSerializer.Deserialize<string>(response.Body);
            actualResult.Should().Be(_jane.GuestId);
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
