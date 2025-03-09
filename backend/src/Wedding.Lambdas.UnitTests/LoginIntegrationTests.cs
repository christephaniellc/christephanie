using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.TestUtilities;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using NUnit.Framework;
using System.Net;
using System.Text.Json.Nodes;
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
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Handlers;
using Wedding.Lambdas.Authorize.Providers;
using Microsoft.Extensions.Configuration;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.FamilyUnit.Get.Handlers;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Configuration;
using Wedding.Common.Multitenancy;
using Amazon.Runtime.Internal.Transform;
using Wedding.Abstractions.ViewModels;

namespace Wedding.Lambdas.UnitTests
{
    [TestFixture]
    public class LoginIntegrationTests
    {
        private Wedding.Lambdas.User.Find.Function? _userFindFunction;
        private Wedding.Lambdas.Authorize.Function? _authFunction;
        private Wedding.Lambdas.FamilyUnit.Get.Function? _familyUnitGetFunction;

        private Mock<ILambdaContext>? _mockLambdaContext;
        private IMapper? _mapper;
        private TestTokenHelper? _testTokenHelper;
        private FindUserHandler? _findUserHandler;
        private AuthHandler? _authHandler;
        private GetFamilyUnitHandler? _getFamilyUnitHandler;

        private string _johnAuth0Id = "auth0|12345";

        public string _authorizeArn = "arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-authorize";

        public void SetUpHandlers(Mock<IDynamoDBProvider> dynamoDBProvider, ServiceCollection serviceCollection)
        {
            var mockLogger = new Mock<ILogger<AuthHandler>>();
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
                .ReturnsAsync(_testTokenHelper!.JwtAudience);

            var authProvider = new DatabaseRoleProvider(new Mock<ILogger<DatabaseRoleProvider>>().Object, _mapper!, dynamoDBProvider.Object, mockAuthenticationProvider.Object, new Mock<MultitenancySettingsProvider>().Object);

            _findUserHandler = new FindUserHandler(Mock.Of<ILogger<FindUserHandler>>(), dynamoDBProvider.Object, _mapper!);
            _authHandler = new AuthHandler(mockLogger.Object, authProvider);
            _getFamilyUnitHandler = new GetFamilyUnitHandler(Mock.Of<ILogger<GetFamilyUnitHandler>>(), dynamoDBProvider.Object, _mapper!);

            serviceCollection.AddScoped(_ => _findUserHandler);
            serviceCollection.AddScoped(_ => _authHandler);
            serviceCollection.AddScoped(_ => _getFamilyUnitHandler);
        }
        
        public void SetUpRepository(Mock<IDynamoDBProvider> dynamoDBProvider)
        {
            var familySearchResult = new List<WeddingEntity>
            {
                _mapper!.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE),
                _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN),
                _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE)
            };

            // var mockAsyncSearch = new Mock<AsyncSearch<WeddingEntity>>(MockBehavior.Strict);
            // mockAsyncSearch.Setup(x => x.GetRemainingAsync(default))
            //     .ReturnsAsync(familySearchResult);
            //
            // var partitionKey = DynamoKeys.GetPartitionKey(TestDataHelper.TEST_INVITATION_CODE);
            // repository.Setup(x => x.QueryAsync<WeddingEntity>(partitionKey, It.IsAny<DynamoDBOperationConfig>()))
            //     .Returns(mockAsyncSearch.Object);
            //
            // var familyUnitSortKey = DynamoKeys.GetFamilyInfoSortKey();
            // repository.Setup(x => x.LoadAsync<WeddingEntity>(partitionKey, familyUnitSortKey, It.IsAny<CancellationToken>()))
            //     .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            // repository.Setup(x => x.LoadAsync<WeddingEntity>(TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<DynamoDBOperationConfig>(), It.IsAny<CancellationToken>()))
            //     .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));
            //
            // repository.Setup(x => x.FromQueryAsync<WeddingEntity>(It.IsAny<QueryOperationConfig>(), It.IsAny<DynamoDBOperationConfig>()))
            //     .Returns(mockAsyncSearch.Object);
            // var mockAsyncSearch = new Mock<AsyncSearch<WeddingEntity>>(MockBehavior.Strict);
            // mockAsyncSearch.Setup(x => x.GetRemainingAsync(default))
            //     .ReturnsAsync(familySearchResult);

            //var partitionKey = DynamoKeys.GetPartitionKey(TestDataHelper.TEST_INVITATION_CODE);
            dynamoDBProvider.Setup(x => x.QueryAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(familySearchResult);

            dynamoDBProvider.Setup(x => x.LoadFamilyUnitOnlyAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            dynamoDBProvider.Setup(x => x.QueryByGuestIdIndex(_testTokenHelper!.JwtAudience, TestDataHelper.GUEST_JOHN.GuestId,  It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<WeddingEntity> {_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN) });
            dynamoDBProvider.Setup(x => x.QueryByGuestIdIndex(_testTokenHelper!.JwtAudience, TestDataHelper.GUEST_JANE.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<WeddingEntity> { _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE) });
            dynamoDBProvider.Setup(x =>
                    x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(TestDataHelper.FAMILY_DOE);
            dynamoDBProvider.Setup(x => x.FromQueryAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(familySearchResult);

        }

        public void SetUpFunctions(ServiceCollection serviceCollection)
        {
            serviceCollection.AddScoped<IMultitenancySettingsProvider, MultitenancySettingsProvider>();
            var serviceProvider = serviceCollection.BuildServiceProvider();

            _userFindFunction = new Wedding.Lambdas.User.Find.Function(serviceProvider);
            _authFunction = new Wedding.Lambdas.Authorize.Function(serviceProvider, _testTokenHelper!.JwtAuthority, _testTokenHelper.JwtAudience);
            _familyUnitGetFunction = new Wedding.Lambdas.FamilyUnit.Get.Function(serviceProvider);
        }

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
            .Build();

            _testTokenHelper = new TestTokenHelper(configuration);

            var config = new MapperConfiguration(cfg =>
                {
                    cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                    cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                    cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
                }
            );
            _mapper = config.CreateMapper();

            _mockLambdaContext = new Mock<ILambdaContext>();
            _mockLambdaContext.Setup(x => x.Logger).Returns(new Mock<ILambdaLogger>().Object);

            var serviceCollection = new ServiceCollection();
            var dynamoDBProvider = new Mock<IDynamoDBProvider>();

            SetUpRepository(dynamoDBProvider);
            SetUpHandlers(dynamoDBProvider, serviceCollection);
            SetUpFunctions(serviceCollection);
        }

        [TestCase(false)]
        [TestCase(true)]
        public async Task ShouldLogin(bool tokenWithGuestId)
        {
            // Step 1. Find user first by invitation code and first name
            var context = new TestLambdaContext();
            var command = new FindUserQuery(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, "John");
            var request = new APIGatewayProxyRequest
            {
                QueryStringParameters = QueryStringHelper.ConvertToQueryStringParameters(command),
                Headers = new Dictionary<string, string>()
                {
                    {"Origin", _testTokenHelper.JwtAudience}
                }
            };

            var response = await _userFindFunction!.FunctionHandler(request, context);
            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
            response.Headers["Content-Type"].Should().Be("application/json");


            var actualResult = response.GetResponseBodyData<JsonObject>()[0];
            actualResult.Should().NotBeNull();
            actualResult!.GetValue<string>().Should().Be(TestDataHelper.GUEST_JOHN.GuestId);

            // Step 2. Authorize user by token and guest ID 
            var token = await _testTokenHelper.GenerateAuth0Token(tokenWithGuestId ? TestDataHelper.GUEST_JOHN.GuestId : null);

            var ipAddress = "127.0.0.1";
            var authRequest = new APIGatewayCustomAuthorizerRequest
            {
                AuthorizationToken = token,
                MethodArn = _authorizeArn,
                Headers = new Dictionary<string, string>
                {
                    { "authorization", "Bearer " + token },
                    { "X-Forwarded-For", ipAddress}
                },
                RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
                {
                    RouteKey = "GET /api/familyunit"
                }
            };

            var authResponse = await _authFunction!.FunctionHandler(authRequest, context);

            if (!tokenWithGuestId)
            {
                authResponse.Should().NotBeNull();
                authResponse.PrincipalID.Should().Be("unknown");
                authResponse!.PolicyDocument!.Statement!.FirstOrDefault()!.Effect.Should().Be(PolicyEffectEnum.Deny.ToString());
                authResponse.Context.Should().Contain(x => x.Key == "error" && x.Value.Equals("Invalid token"));
            }
            else
            {
                authResponse.Should().NotBeNull();
                authResponse.PrincipalID.Should().Be(_johnAuth0Id);
                authResponse.PolicyDocument.Statement.FirstOrDefault()!.Effect.Should().Be(PolicyEffectEnum.Allow.ToString());
                //authResponse.PolicyDocument.Statement.FirstOrDefault().Resource.FirstOrDefault().Should().Be("GET /api/familyunit");
                authResponse.PolicyDocument.Statement.FirstOrDefault()!.Resource.FirstOrDefault().Should().Be("arn:aws:lambda:us-east-1:390403858788:function:christephanie-wedding-api-authorize");
                authResponse.PolicyDocument.Statement.FirstOrDefault()!.Action.FirstOrDefault().Should().Be("execute-api:Invoke");
                authResponse.Context.Should().Contain(x => x.Key == "token" && x.Value.Equals(token));
                authResponse.Context.Should().Contain(x => x.Key == "guestId" && x.Value.Equals(TestDataHelper.GUEST_JOHN.GuestId));
                authResponse.Context.Should().Contain(x => x.Key == "roles" && x.Value.Equals(RoleEnum.Guest.ToString()));
                authResponse.Context.Should().Contain(x => x.Key == "invitationCode" && x.Value.Equals(TestDataHelper.GUEST_JOHN.InvitationCode));
                authResponse.Context.Should().Contain(x => x.Key == "ipAddress" && x.Value.Equals(ipAddress));

                // Step 3. Get family unit DTO using auth context
                var familyUnitRequest = new APIGatewayProxyRequest().AddAuthToRequest(authResponse);
                var familyUnitGetResponse = await _familyUnitGetFunction!.FunctionHandler(familyUnitRequest, context);
                var familyUnit = familyUnitGetResponse.GetResponseBodyData<FamilyUnitViewModel>();
                
                familyUnitGetResponse.Should().NotBeNull();
                familyUnit.Guests!.Count.Should().Be(2);
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
                    { "audience", _testTokenHelper!.JwtAudience},
                    { "invitationCode", "ABAAB" },
                    { "firstName", "John" }
                },
                Headers = new Dictionary<string, string>()
                {
                    { "Origin", $"{_testTokenHelper.JwtAudience}"}
                }
            };

            // Act
            var response = await _userFindFunction!.FunctionHandler(request, _mockLambdaContext!.Object);

            // Assert
            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
            response.Headers["Content-Type"].Should().Be("application/json");

            var actualResult = response.GetResponseBodyData<JsonObject>()[0];
            actualResult.Should().NotBeNull();
            actualResult!.GetValue<string>().Should().Be(TestDataHelper.GUEST_JOHN.GuestId);
        }

        [Test]
        public async Task FunctionHandler_ReturnsOkResponse_OnSuccessJane()
        {
            // Arrange
            var request = new APIGatewayProxyRequest
            {
                QueryStringParameters = new Dictionary<string, string>
                {
                    { "audience", _testTokenHelper!.JwtAudience},
                    { "invitationCode", TestDataHelper.TEST_INVITATION_CODE },
                    { "firstName", "Jane" }
                },
                Headers = new Dictionary<string, string>()
                {
                    { "Origin", $"{_testTokenHelper.JwtAudience}"}
                }
            };

            // Act
            var response = await _userFindFunction!.FunctionHandler(request, _mockLambdaContext!.Object);

            // Assert
            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
            response.Headers["Content-Type"].Should().Be("application/json");

            var actualResult = response.GetResponseBodyData<JsonObject>()[0];
            actualResult.Should().NotBeNull();
            actualResult!.GetValue<string>().Should().Be(TestDataHelper.GUEST_JANE.GuestId);
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
