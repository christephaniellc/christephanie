using System.Net;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.AWS.Frontend;
using Wedding.Common.Serialization;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Handlers;
using Wedding.Lambdas.UnitTests.TestData;
using LogLevel = Microsoft.Extensions.Logging.LogLevel;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Delete
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Delete.Function))]
    public class AdminDeleteFunctionTests
    {
        private IMapper? _mapper;
        private Mock<ILogger<AdminDeleteFamilyUnitHandler>>? _handlerLogger;
        private Mock<ILambdaContext>? _mockLambdaContext;
        private Mock<IDynamoDBProvider>? _dynamoDBProvider;
        private TestTokenHelper? _testTokenHelper;
        private Wedding.Lambdas.Admin.FamilyUnit.Delete.Function? _function;
        private TestAuthorizer? _testAuthorizer;

        [SetUp]
        public void Setup()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();
            var config = new MapperConfiguration(cfg =>
                {
                    cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                    cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                    cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
                }
            );
            _mapper = config.CreateMapper();
            _testTokenHelper = new TestTokenHelper(configuration);

            _handlerLogger = new Mock<ILogger<AdminDeleteFamilyUnitHandler>>();
            _mockLambdaContext = new Mock<ILambdaContext>();
            _mockLambdaContext.Setup(x => x.Logger).Returns(new Mock<ILambdaLogger>().Object);
            _dynamoDBProvider = new Mock<IDynamoDBProvider>();

            var deleteFamilyUnitHandler = new AdminDeleteFamilyUnitHandler(_handlerLogger.Object, _dynamoDBProvider.Object, _mapper);

            var serviceCollection = new ServiceCollection();
            serviceCollection.AddScoped(_ => deleteFamilyUnitHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            _testAuthorizer = new TestAuthorizer(configuration, serviceCollection);
            _function = new Wedding.Lambdas.Admin.FamilyUnit.Delete.Function(serviceProvider);
        }

        [Test]
        public async Task ShouldNotDeleteNonexistantFamily()
        {
            // Arrange
            var invitationCode = "XXXXX";

            var authContext = await _testAuthorizer!.MockAuthorize(TestDataHelper.GUEST_ADMIN);
            var request = new APIGatewayProxyRequest
            {
                PathParameters = new Dictionary<string, string>
                {
                    {"invitationCode", invitationCode}
                }
            }.AddAuthToRequest(authContext);

            // Act
            var result = await _function!.FunctionHandler(request, _mockLambdaContext!.Object);
            var errorResult = JsonSerializer.Deserialize<FrontendApiError>(result.Body);

            // Assert
            result.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
            errorResult!.Status.Should().Be((int)HttpStatusCode.InternalServerError);
            errorResult.Error.Should().Be("System.Exception");
            errorResult.Description.Should().Contain("Error occurred: An error occurred while deleting the family unit.");

            var expectedLog = $"Could not delete family with invitation code '{invitationCode}': family not found.";
            _handlerLogger!.Verify(
                x => x.Log(
                    It.Is<LogLevel>(l => l == LogLevel.Error),
                    It.IsAny<EventId>(), 
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains(expectedLog)), 
                    It.IsAny<Exception>(),
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)!),
                Times.Once);
        }

        [Test]
        public async Task ShouldNotDeleteFamilyWhenNotAdmin()
        {
            // Arrange
            var invitationCode = TestDataHelper.TEST_INVITATION_CODE;

            var family = _mapper!.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE);

            _dynamoDBProvider!.Setup(x => x.QueryAsync(_testTokenHelper!.JwtAudience, invitationCode, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<WeddingEntity> { family });

            var authContextResponse = await _testAuthorizer!.MockAuthorize(TestDataHelper.GUEST_JOHN);
            var authContext = new AuthContext
            {
                Audience = authContextResponse.GetAudienceFromAuth()!,
                InvitationCode = authContextResponse.GetInvitationCodeFromAuth()!,
                GuestId = authContextResponse.GetGuestIdFromAuth()!,
                Roles = authContextResponse.GetRolesFromAuth()!.ToString()!,
                IpAddress = "127.0.0.1"
            };
            var command = new AdminDeleteFamilyUnitCommand(invitationCode, authContext);
            var request = new APIGatewayProxyRequest
            {
                PathParameters = new Dictionary<string, string>
                {
                    {"invitationCode", invitationCode}
                },
                Body = JsonSerializer.Serialize(command, JsonSerializationHelper.FromFrontendOptions)
            }.AddAuthToRequest(authContextResponse);

            // Act
            var result = await _function!.FunctionHandler(request, _mockLambdaContext!.Object);
            var errorResult = JsonSerializer.Deserialize<FrontendApiError>(result.Body);

            // Assert
            result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
            errorResult!.Status.Should().Be((int)HttpStatusCode.BadRequest);
            errorResult.Error.Should().Be("FluentValidation.ValidationException");
            errorResult.Description.Should().Contain("AuthContext: No admin permissions.");
        }

        [Test]
        public async Task ShouldDeleteFamily()
        {
            // Arrange
            var invitationCode = TestDataHelper.TEST_INVITATION_CODE;

            var family = _mapper!.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE);

            _dynamoDBProvider!.Setup(x => x.QueryAsync(_testTokenHelper!.JwtAudience, invitationCode, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<WeddingEntity> { family });

            var authContextResponse = await _testAuthorizer!.MockAuthorize(TestDataHelper.GUEST_ADMIN);
            var authContext = new AuthContext
            {
                Audience = authContextResponse.GetAudienceFromAuth()!,
                InvitationCode = authContextResponse.GetInvitationCodeFromAuth()!,
                GuestId = authContextResponse.GetGuestIdFromAuth()!,
                Roles = authContextResponse.GetRolesFromAuth()!.ToString()!,
                IpAddress = authContextResponse.GetIpAddressFromAuth()!
            };
            var command = new AdminDeleteFamilyUnitCommand(invitationCode, authContext);
            var request = new APIGatewayProxyRequest
            {
                PathParameters = new Dictionary<string, string>
                {
                    {"invitationCode", invitationCode}
                },
                Body = JsonSerializer.Serialize(command, JsonSerializationHelper.FromFrontendOptions)
            }.AddAuthToRequest(authContextResponse);

            // Act
            var result = await _function!.FunctionHandler(request, _mockLambdaContext!.Object);

            // Assert
            result.StatusCode.Should().Be((int)HttpStatusCode.OK);
            result.Body.Should().Contain("Successfully deleted family unit");
            result.Body.Should().Contain(invitationCode);
        }
    }
}
