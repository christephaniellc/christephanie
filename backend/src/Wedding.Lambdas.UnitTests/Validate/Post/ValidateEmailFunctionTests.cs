using Amazon.Lambda.TestUtilities;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using FluentAssertions;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.JwtClaim;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Lambdas.Validate.Email.Handlers;
using Wedding.Lambdas.Validate.Email.Requests;
using Wedding.Abstractions.Dtos.Auth;
using Amazon.SimpleEmail.Model;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Helpers;

namespace Wedding.Lambdas.UnitTests.Validate.Post
{
    [TestFixture]
    [UnitTestsFor(typeof(Wedding.Lambdas.Validate.Email.Function))]
    public class ValidateEmailFunctionTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private Mock<IAwsSesHelper>? _mockAwsSesHelper;
        private Mock<IAwsParameterCacheProvider> _mockAwsParameterCacheProvider;
        private TestTokenHelper? _testTokenHelper;
        private string? _testEncryptionKey;
        private AuthContext? _fakeAuthContext;
        private Wedding.Lambdas.Validate.Email.Function? Sut;

        private TestLambdaContext? _lambdaContext;

        [SetUp]
        public void SetUp()
        {
            var serviceCollection = new ServiceCollection();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();
            _mockAwsSesHelper = new Mock<IAwsSesHelper>();
            _mockAwsParameterCacheProvider = new Mock<IAwsParameterCacheProvider>();
            _testEncryptionKey = ValidationTokenProvider.GenerateSecretKey();

            var testConfig = new ApplicationConfiguration { EncryptionKey = _testEncryptionKey };
            _mockAwsParameterCacheProvider.Setup(x => x.GetConfigAsync<ApplicationConfiguration>())
                .ReturnsAsync(testConfig);
            
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
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
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JANE.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE));
 
            var emailValidationHandler = new EmailValidationHandler(Mock.Of<ILogger<EmailValidationHandler>>(),
                _mockDynamoDbProvider.Object,
                _mapper,
                _mockAwsSesHelper.Object,
                _mockAwsParameterCacheProvider.Object);

            serviceCollection.AddScoped(_ => emailValidationHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            Sut = new Wedding.Lambdas.Validate.Email.Function(serviceProvider);
        }

        [Test]
        public async Task ShouldRegisterEmail()
        {
            var dto = TestDataHelper.FAMILY_DOE;
            _mockDynamoDbProvider!.Setup(x =>
                    x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(dto);
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper!.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));

            var request = new ValidateEmailRequest
            {
                Action = VerifyEnum.Register,
                Email = dto.Guests![0].Email!.Value
            };

            var proxyRequest = TestRequestHelper.RequestAsJohn(request);

            var response = await Sut!.FunctionHandler(proxyRequest, _lambdaContext!);
            var result = response.GetResponseBodyData<ValidateEmailResponse>();

            result.EmailVerifyState.Verified.Should().BeFalse();
            result.EmailVerifyState.Value.Should().Be(dto.Guests![0].Email!.Value);
            
            _mockAwsSesHelper!.Verify(x => x.SendValidationEmail(It.IsAny<AuthContext>(), It.IsAny<VerifiedDto>(), 
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void ShouldGenerateKey()
        {
            var test = ValidationTokenProvider.GenerateSecretKey();
            test.Should().NotBeNull();
        }


        [Test]
        public async Task ShouldValidateEmail()
        {
            var dto = TestDataHelper.FAMILY_DOE;
            var verifyDto = new VerifiedDto
            {
                Verified = false,
                Value = dto.Guests![0].Email!.Value,
                VerificationCode = VerificationCodeHelper.GenerateCode(),
                VerificationCodeExpiration = VerificationCodeHelper.GenerateExpiry()
            };

            var john = TestDataHelper.GUEST_JOHN;
            john.Email = verifyDto;

            _mockDynamoDbProvider!.Setup(x =>
                    x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(dto);
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper!.Map<WeddingEntity>(john));

            var request = new ValidateEmailRequest
            {
                Action = VerifyEnum.Register,
                Email = dto.Guests![0].Email!.Value
            };

            var proxyRequest = TestRequestHelper.RequestAsJohn(request);

            var response = await Sut!.FunctionHandler(proxyRequest, _lambdaContext!);
            var result = response.GetResponseBodyData<ValidateEmailResponse>();

            result.EmailVerifyState.Verified.Should().BeFalse();
            result.EmailVerifyState.Value.Should().Be(dto.Guests![0].Email!.Value);

            _mockAwsSesHelper!.Verify(x => x.SendValidationEmail(It.IsAny<AuthContext>(), It.IsAny<VerifiedDto>(),
                It.IsAny<CancellationToken>()), Times.Once);

            var verifyRequest = new ValidateEmailRequest
            {
                Action = VerifyEnum.Validate,
                Token = ValidationTokenProvider.GenerateJwtToken(_fakeAuthContext.Audience,
                    _fakeAuthContext.InvitationCode,
                    _fakeAuthContext.GuestId,
                    result.EmailVerifyState.VerificationCode,
                    _testEncryptionKey)
            };

            var verifyProxyRequest = TestRequestHelper.RequestAsJohn(verifyRequest);

            var verifyResponse = await Sut!.FunctionHandler(verifyProxyRequest, _lambdaContext!);
            var verifyResult = verifyResponse.GetResponseBodyData<ValidateEmailResponse>();

            verifyResult.EmailVerifyState.Verified.Should().BeTrue();
            verifyResult.EmailVerifyState.Value.Should().Be(dto.Guests![0].Email!.Value);
        }
    }
}
