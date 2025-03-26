using System.Net;
using Amazon.Lambda.TestUtilities;
using Amazon.SimpleEmail.Model;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.JwtClaim;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Lambdas.Verify.Email.Handlers;

namespace Wedding.Lambdas.UnitTests.Admin.Configuration
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.Admin.Configuration.Invitation.Function))]
    public class AdminConfigurationInvitationFunctionTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private Mock<IAwsSesHelper>? _mockAwsSesHelper;
        private Mock<IAwsParameterCacheProvider> _mockAwsParameterCacheProvider;
        private TestTokenHelper? _testTokenHelper;
        private string? _testEncryptionKey;
        private AuthContext? _fakeAuthContext;
        private string? _testOrigin;
        private ApplicationConfiguration? _testConfig;
        private Lambdas.Admin.Configuration.Invitation.Function? Sut;

        private TestLambdaContext? _lambdaContext;

        [SetUp]
        public void SetUp()
        {
            var serviceCollection = new ServiceCollection();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();
            _mockAwsSesHelper = new Mock<IAwsSesHelper>();
            _mockAwsParameterCacheProvider = new Mock<IAwsParameterCacheProvider>();
            _testEncryptionKey = ValidationTokenProvider.GenerateSecretKey();

            _testConfig = new ApplicationConfiguration { EncryptionKey = _testEncryptionKey, DomainName = "testdomain" };
            _mockAwsParameterCacheProvider.Setup(x => x.GetConfigAsync<ApplicationConfiguration>())
                .ReturnsAsync(_testConfig);

            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _testOrigin = "https://api.christephanie.com";
            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles),
                Name = TestDataHelper.GUEST_JOHN.FirstName + " " + TestDataHelper.GUEST_JOHN.LastName,
                IpAddress = "127.0.0.1"
            };

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
                cfg.AddProfiles(DesignConfigurationEntityToDtoMapping.Profiles());
            }
            );

            _mapper = config.CreateMapper();

            _lambdaContext = new TestLambdaContext();

            _mockAwsSesHelper.Setup(x =>
                x.SendValidationEmail(It.IsAny<AuthContext>(), It.IsAny<VerifiedDto>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SendEmailResponse
                {
                    HttpStatusCode = System.Net.HttpStatusCode.OK
                });

            _mockDynamoDbProvider.Setup(x =>
                    x.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));

            var emailValidationHandler = new VerifyEmailHandler(Mock.Of<ILogger<VerifyEmailHandler>>(),
                _mockDynamoDbProvider.Object,
                _mapper,
                _mockAwsParameterCacheProvider.Object);

            serviceCollection.AddScoped(_ => emailValidationHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            Sut = new Lambdas.Admin.Configuration.Invitation.Function(serviceProvider);
        }

        [Test]
        public async Task FunctionHandler_WithValidPostRequest_ShouldReturnOk()
        {
            // Arrange
            var dto = new InvitationDesignDto
            {
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                DesignId = "design123",
                Orientation = OrientationEnum.Landscape,
                SeparatorWidth = 3,
                SeparatorColor = "#ffccdd",
                PhotoGridItems = new List<PhotoGridItemDto>()
            };

            var request = TestRequestHelper.RequestAsJohn(dto, queryStringParams: null, httpMethod: "POST");

            // Act
            var result = await Sut!.FunctionHandler(request, _lambdaContext!);

            // Assert
            result.StatusCode.Should().Be((int)HttpStatusCode.OK);
            result.Body.Should().NotBeNullOrWhiteSpace();
        }

        [Test]
        public async Task FunctionHandler_WithPostRequestAndNullBody_ShouldReturnBadRequest()
        {
            // Arrange
            var request = TestRequestHelper.RequestAsJohn((InvitationDesignDto) null, 
                queryStringParams: null, httpMethod: "POST");

            // Act
            var result = await Sut!.FunctionHandler(request, _lambdaContext!);

            // Assert
            result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
            result.Body.Should().Contain("Request body is required");
        }

        [Test]
        public async Task FunctionHandler_WithUnsupportedMethod_ShouldReturnMethodNotAllowed()
        {
            // Arrange
            var request = TestRequestHelper.RequestAsJohn(queryStringParams: null, httpMethod: "PATCH");

            // Act
            var result = await Sut!.FunctionHandler(request, _lambdaContext!);

            // Assert
            result.StatusCode.Should().Be((int)HttpStatusCode.MethodNotAllowed);
            result.Body.Should().Contain("Unsupported HTTP method");
        }

        [Test]
        public async Task FunctionHandler_WithGetRequestAndNoDesignId_ShouldReturnOk()
        {
            // Arrange
            var queryStringParams = new Dictionary<string, string>(); // No designId
            var request = TestRequestHelper.RequestAsJohn(queryStringParams: queryStringParams, httpMethod: "GET");

            // Act
            var result = await Sut!.FunctionHandler(request, _lambdaContext!);

            // Assert
            result.StatusCode.Should().Be((int)HttpStatusCode.OK);
            result.Body.Should().NotBeNull();
        }

        [Test]
        public async Task FunctionHandler_WithDeleteRequestWithoutDesignId_ShouldReturnBadRequest()
        {
            // Arrange
            var designId = "987654321";
            var queryStringParams = new Dictionary<string, string>
            {
                {"designId", designId}
            };

            var request = TestRequestHelper.RequestAsJohn(queryStringParams: queryStringParams, httpMethod: "DELETE");

            // Act
            var result = await Sut!.FunctionHandler(request, _lambdaContext!);

            // Assert
            result.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
            result.Body.Should().Contain("Design ID is required");
        }

    }
}
