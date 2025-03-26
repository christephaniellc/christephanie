using System.Net;
using Amazon.Lambda.APIGatewayEvents;
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
using Wedding.Abstractions.Mapping;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Helpers;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.JwtClaim;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Lambdas.Verify.Email.Handlers;

namespace Wedding.Lambdas.UnitTests.Validate.Post
{
    [TestFixture]
    [UnitTestsFor(typeof(Wedding.Lambdas.Verify.Email.Function))]
    public class VerifyEmailFunctionTests
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
        private Wedding.Lambdas.Verify.Email.Function? Sut;

        private TestLambdaContext? _lambdaContext;

        [SetUp]
        public void SetUp()
        {
            var serviceCollection = new ServiceCollection();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();
            _mockAwsSesHelper = new Mock<IAwsSesHelper>();
            _mockAwsParameterCacheProvider = new Mock<IAwsParameterCacheProvider>();
            _testEncryptionKey = ValidationTokenProvider.GenerateSecretKey();

            _testConfig = new ApplicationConfiguration { EncryptionKey = _testEncryptionKey, DomainName = "testdomain"};
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

            Sut = new Wedding.Lambdas.Verify.Email.Function(serviceProvider, "authority", _testOrigin);
        }

        // [Test]
        // public async Task ShouldValidateEmail()
        // {
        //     var dto = TestDataHelper.FAMILY_DOE;
        //     var verifyDto = new VerifiedDto
        //     {
        //         Verified = false,
        //         Value = dto.Guests![0].Email!.Value,
        //         VerificationCode = VerificationCodeHelper.GenerateCode(),
        //         VerificationCodeExpiration = VerificationCodeHelper.GenerateExpiry()
        //     };
        //
        //     var john = TestDataHelper.GUEST_JOHN;
        //     john.Email = verifyDto;
        //
        //     _mockDynamoDbProvider!.Setup(x =>
        //             x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
        //         .ReturnsAsync(dto);
        //     _mockDynamoDbProvider.Setup(x =>
        //             x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
        //         .ReturnsAsync(_mapper!.Map<WeddingEntity>(john));
        //
        //     var request = new ValidateEmailRequest
        //     {
        //         Action = VerifyEnum.Register,
        //         Email = dto.Guests![0].Email!.Value
        //     };
        //     var command = new VerifyEmailCommand()
        //
        //     var proxyRequest = TestRequestHelper.RequestAsJohn(request);
        //
        //     var response = await Sut!.FunctionHandler(proxyRequest, _lambdaContext!);
        //     var result = response.GetResponseBodyData<ValidateEmailResponse>();
        //
        //     result.EmailVerifyState.Verified.Should().BeFalse();
        //     result.EmailVerifyState.Value.Should().Be(dto.Guests![0].Email!.Value);
        //
        //     _mockAwsSesHelper!.Verify(x => x.SendValidationEmail(It.IsAny<AuthContext>(), It.IsAny<VerifiedDto>(),
        //         It.IsAny<CancellationToken>()), Times.Once);
        //
        //     var verifyRequest = new ValidateEmailRequest
        //     {
        //         Action = VerifyEnum.Validate,
        //         Token = ValidationTokenProvider.GenerateJwtToken(_fakeAuthContext.Audience,
        //             _fakeAuthContext.InvitationCode,
        //             _fakeAuthContext.GuestId,
        //             result.EmailVerifyState.VerificationCode,
        //             _testEncryptionKey)
        //     };
        //
        //     var verifyProxyRequest = TestRequestHelper.RequestAsJohn(verifyRequest);
        //
        //     var verifyResponse = await Sut!.FunctionHandler(verifyProxyRequest, _lambdaContext!);
        //     var verifyResult = verifyResponse.GetResponseBodyData<ValidateEmailResponse>();
        //
        //     verifyResult.EmailVerifyState.Verified.Should().BeTrue();
        //     verifyResult.EmailVerifyState.Value.Should().Be(dto.Guests![0].Email!.Value);
        // }

        [Test]
        public async Task FunctionHandler_MissingOrigin_ReturnsBadRequest()
        {
            var code = VerificationCodeHelper.GenerateCode();
            var token = ValidationTokenProvider.GenerateJwtToken(_testOrigin,
                TestDataHelper.FAMILY_DOE.InvitationCode,
                TestDataHelper.GUEST_JOHN.GuestId,
                code,
                _testConfig.EncryptionKey);

            var request = new APIGatewayProxyRequest
            {
                QueryStringParameters = new Dictionary<string, string>
                {
                    { "token", token }
                }
            };

            var response = await Sut!.FunctionHandler(request, _lambdaContext!);

            response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
            response.Body.Should().Contain("shifty");
        }

        [Test]
        public async Task FunctionHandler_InvalidToken_ReturnsBadRequest()
        {
            var request = new APIGatewayProxyRequest
            {
                Headers = new Dictionary<string, string>
                {
                    { "origin", _testOrigin }
                },
                QueryStringParameters = new Dictionary<string, string>
                {
                    { "token", "clearly-invalid-token" }
                }
            };

            var response = await Sut!.FunctionHandler(request, _lambdaContext!);

            response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
            response.Body.Should().Contain("Validation failed");
        }

        [Test]
        public async Task FunctionHandler_GuestNotFound_ReturnsNotFound()
        {
            // Override default setup
            _mockDynamoDbProvider!.Setup(x =>
                    x.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new KeyNotFoundException("Guest not found"));

            var code = VerificationCodeHelper.GenerateCode();

            var token = ValidationTokenProvider.GenerateJwtToken(_testOrigin, 
                TestDataHelper.FAMILY_DOE.InvitationCode, 
                TestDataHelper.GUEST_JOHN.GuestId, 
                code, 
                _testConfig.EncryptionKey);
            
            var request = new APIGatewayProxyRequest
            {
                Headers = new Dictionary<string, string>
                {
                    { "origin", _testOrigin }
                },
                QueryStringParameters = new Dictionary<string, string>
                {
                    { "token", token },
                }
            };

            var response = await Sut!.FunctionHandler(request, _lambdaContext!);

            response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
            response.Body.Should().Contain("KeyNotFoundException");
        }

        [Test]
        public async Task FunctionHandler_UnexpectedException_ReturnsInternalServerError()
        {
            _mockDynamoDbProvider!.Setup(x =>
                    x.LoadFamilyUnitOnlyAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Boom!"));

            var code = VerificationCodeHelper.GenerateCode();
            var token = ValidationTokenProvider.GenerateJwtToken(_testOrigin,
                TestDataHelper.FAMILY_DOE.InvitationCode,
                TestDataHelper.GUEST_JOHN.GuestId,
                code,
                _testConfig.EncryptionKey);

            var request = new APIGatewayProxyRequest
            {
                Headers = new Dictionary<string, string>
                {
                    { "origin", _testOrigin }
                },
                QueryStringParameters = new Dictionary<string, string>
                {
                    { "token", token }
                }
            };

            var response = await Sut!.FunctionHandler(request, _lambdaContext!);

            response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
            response.Body.Should().Contain("Application exception");
        }


        [Test]
        public async Task FunctionHandler_ValidTokenAndOrigin_ReturnsOk()
        {
            var dto = TestDataHelper.GUEST_JOHN;

            var code = VerificationCodeHelper.GenerateCode();
            var expiry = VerificationCodeHelper.GenerateExpiry();
            var token = ValidationTokenProvider.GenerateJwtToken(_testOrigin,
                TestDataHelper.FAMILY_DOE.InvitationCode,
                TestDataHelper.GUEST_JOHN.GuestId,
                code,
                _testConfig.EncryptionKey);

            dto.Email = new VerifiedDto
            {
                Value = dto.Email.Value,
                VerificationCode = code,
                VerificationCodeExpiration = expiry
            };

            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(dto));

            var request = new APIGatewayProxyRequest
            {
                Headers = new Dictionary<string, string>
                {
                    { "origin", _testOrigin }
                },
                QueryStringParameters = new Dictionary<string, string>
                {
                    { "token", token }
                }
            };

            var response = await Sut!.FunctionHandler(request, _lambdaContext!);

            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
            response.Body.Should().Contain("true");
        }

    }
}
