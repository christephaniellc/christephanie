using System.Net;
using Amazon.Lambda.TestUtilities;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Lambdas.Validate.Phone.Handlers;
using Wedding.Lambdas.Validate.Phone.Requests;
using Wedding.Common.ThirdParty;
using Amazon.SimpleSystemsManagement.Model;
using System.Numerics;
using NSubstitute;

namespace Wedding.Lambdas.UnitTests.Validate.Post
{
    [TestFixture]
    [UnitTestsFor(typeof(Wedding.Lambdas.Validate.Phone.Function))]
    public class ValidatePhoneFunctionTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private Mock<IAwsSmsHelper>? _mockAwsSmsHelper;
        private Mock<ITwilioSmsProvider>? _mockTwilioSmsProvider;
        private TestTokenHelper? _testTokenHelper;
        private Wedding.Lambdas.Validate.Phone.Function? Sut;

        private TestLambdaContext? _lambdaContext;

        [SetUp]
        public void SetUp()
        {
            var serviceCollection = new ServiceCollection();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();
            _mockAwsSmsHelper = new Mock<IAwsSmsHelper>();

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
            
            _lambdaContext = new TestLambdaContext();

            _mockAwsSmsHelper.Setup(x =>
                x.SendVerificationCode(It.IsAny<string>(), It.IsAny<string>()))
                    .ReturnsAsync(HttpStatusCode.OK);

            _mockDynamoDbProvider.Setup(x =>
                    x.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JANE.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE));
            _mockTwilioSmsProvider = new Mock<ITwilioSmsProvider>();

            _mockTwilioSmsProvider.Setup(x =>
                x.CheckVerification(TestDataHelper.GUEST_JOHN.Phone.Value, It.IsAny<string>()))
                    .ReturnsAsync(true);

            var phoneValidationHandler = new PhoneValidationHandler(Mock.Of<ILogger<PhoneValidationHandler>>(), 
                _mockDynamoDbProvider.Object, 
                _mapper,
                _mockTwilioSmsProvider.Object);

            serviceCollection.AddScoped(_ => phoneValidationHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            Sut = new Wedding.Lambdas.Validate.Phone.Function(serviceProvider);
        }

        [Test]
        public async Task ShouldRegisterPhone()
        {
            var dto = TestDataHelper.FAMILY_DOE;
            _mockDynamoDbProvider!.Setup(x =>
                    x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(dto);
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper!.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));

            var request = new ValidatePhoneRequest
            {
                Action = VerifyEnum.Register,
                PhoneNumber = dto.Guests![0].Phone!.Value
            };

            var proxyRequest = TestRequestHelper.RequestAsJohn(request);

            var response = await Sut!.FunctionHandler(proxyRequest, _lambdaContext!);
            var result = response.GetResponseBodyData<ValidatePhoneResponse>();

            result.PhoneVerifyState.Verified.Should().BeFalse();
            result.PhoneVerifyState.Value.Should().Be(dto.Guests![0].Phone!.Value);
            result.VerifiedStatus.Should().Be(TwilioOtpStatusEnum.Pending);

            //_mockAwsSmsHelper!.Verify(x => x.SendVerificationCode(dto!.Guests![0]!.Phone!.Value!, It.IsAny<string>()), Times.Once);
            _mockTwilioSmsProvider!.Verify(x => x.SendOTPCode(dto!.Guests![0]!.Phone!.Value!), Times.Once);
        }

        [Test]
        public async Task ShouldResendCode()
        {
            var dto = TestDataHelper.FAMILY_DOE;

            _mockDynamoDbProvider!.Setup(x =>
                    x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(dto);
            _mockDynamoDbProvider!.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper!.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));

            var request = new ValidatePhoneRequest
            {
                Action = VerifyEnum.ResendCode
            };
            var proxyRequest = TestRequestHelper.RequestAsJohn(request);

            var response = await Sut!.FunctionHandler(proxyRequest, _lambdaContext!);
            var result = response.GetResponseBodyData<ValidatePhoneResponse>();
            
            result.PhoneVerifyState.Verified.Should().BeFalse();
            result.PhoneVerifyState.Value.Should().Be(dto.Guests![0].Phone!.Value);
            result.VerifiedStatus.Should().Be(TwilioOtpStatusEnum.Pending);

            _mockTwilioSmsProvider!.Verify(x => x.SendOTPCode(dto!.Guests![0]!.Phone!.Value!), Times.Once);

            //_mockAwsSmsHelper!.Verify(x => x.SendVerificationCode(dto!.Guests![0]!.Phone!.Value!, It.IsAny<string>()), Times.Once);
        }

        [Test]
        public async Task ShouldValidatePhone()
        {
            var code = "234567";
            var dto = TestDataHelper.FAMILY_DOE;

            var john = dto.Guests!.FirstOrDefault(g => g.GuestId == TestDataHelper.GUEST_JOHN.GuestId);
            john!.Phone = new VerifiedDto
            {
                Value = TestDataHelper.GUEST_JOHN.Phone.Value,
                Verified = false,
                VerificationCode = code,
                VerificationCodeExpiration = DateTime.UtcNow.AddMinutes(10)
            };

            _mockDynamoDbProvider!.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper!.Map<WeddingEntity>(john));
            _mockDynamoDbProvider.Setup(x =>
                    x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(dto);

            var request = new ValidatePhoneRequest
            {
                Action = VerifyEnum.Validate,
                Code = code
            };
            var proxyRequest = TestRequestHelper.RequestAsJohn(request);

            var response = await Sut!.FunctionHandler(proxyRequest, _lambdaContext!);
            var result = response.GetResponseBodyData<ValidatePhoneResponse>();
            
            result.PhoneVerifyState.Verified.Should().BeTrue();
            result.PhoneVerifyState.Value.Should().Be(dto.Guests![0].Phone!.Value);
            result.VerifiedStatus.Should().BeNull();

            _mockTwilioSmsProvider!.Verify(x => x.SendOTPCode(dto!.Guests![0]!.Phone!.Value!), Times.Never);
            //_mockAwsSmsHelper!.Verify(x => x.SendVerificationCode(dto!.Guests![0]!.Phone!.Value!, It.IsAny<string>()), Times.Never);
        }
    }
}
