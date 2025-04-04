using AutoMapper;
using FluentAssertions;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.ThirdParty;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Lambdas.Validate.Phone.Commands;
using Wedding.Lambdas.Validate.Phone.Handlers;

namespace Wedding.Lambdas.UnitTests.Validate.Post
{
    [TestFixture]
    [UnitTestsFor(typeof(PhoneValidationHandler))]
    public class PhoneValidationHandlerTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;
        private Mock<ITwilioSmsProvider>? _mockTwilioSmsProvider;
        
        private AuthContext? _fakeAuthContext;
        
        private PhoneValidationHandler? Sut;

        [SetUp]
        public void SetUp()
        {
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();
        
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();
        
            _testTokenHelper = new TestTokenHelper(configuration);
        
            _mapper = MappingProfileHelper.GetMapper();

            _mockTwilioSmsProvider = new Mock<ITwilioSmsProvider>();
        
            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles),
                IpAddress = "127.0.0.1"
            };
        
            Sut = new PhoneValidationHandler(
                Mock.Of<ILogger<PhoneValidationHandler>>(),
                _mockDynamoDbProvider.Object,
                _mapper,
                _mockTwilioSmsProvider.Object
            );
        }

        [Test]
        public async Task RegisterPhoneCommand_Should_Throw_When_Guest_Not_Found()
        {
            // Arrange
            var command = new RegisterPhoneCommand(_fakeAuthContext!, "+1-234-567-8909");
        
            _mockDynamoDbProvider!
                .Setup(d => d.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);
        
            // Act
            Func<Task> act = async () => await Sut!.ExecuteAsync(command);
        
            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage($"Guest with Invitation code '{_fakeAuthContext!.InvitationCode}' and Guest ID '{_fakeAuthContext.GuestId}' does not exist.");
        }
        
        [Test]
        public async Task RegisterPhoneCommand_Should_Return_VerifyResponse_When_Successful()
        {
            // Arrange
            var command = new RegisterPhoneCommand(_fakeAuthContext!, "+12345678909");
            var guestEntity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_fakeAuthContext!.InvitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(_fakeAuthContext.GuestId),
                InvitationCode = _fakeAuthContext.InvitationCode,
                Phone = null
            };
        
            _mockDynamoDbProvider!
                .Setup(d => d.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(guestEntity);
        
            _mockTwilioSmsProvider!
                .Setup(t => t.SendOTPCode(It.IsAny<string>()))
                .ReturnsAsync(TwilioOtpStatusEnum.Pending);
        
            _mockDynamoDbProvider
                .Setup(d => d.SaveAsync(It.IsAny<string>(), It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
        
            // Act
            var result = await Sut!.ExecuteAsync(command);
        
            // Assert
            result.Should().NotBeNull();
            result.VerifiedStatus.Should().Be(TwilioOtpStatusEnum.Pending);
            result.PhoneVerifyState.Verified.Should().BeFalse();
        }
        
        [Test]
        public async Task ValidatePhoneCommand_Should_Throw_When_Guest_Not_Found()
        {
            // Arrange
            var command = new ValidatePhoneCommand(_fakeAuthContext!, "123456");
        
            _mockDynamoDbProvider!
                .Setup(d => d.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);
        
            // Act
            Func<Task> act = async () => await Sut!.ExecuteAsync(command);
        
            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage($"Guest with Invitation code '{_fakeAuthContext!.InvitationCode}' and Guest ID '{_fakeAuthContext.GuestId}' does not exist.");
        }
        
        [Test]
        public async Task ValidatePhoneCommand_Should_Throw_When_Phone_Is_Null()
        {
            // Arrange
            var command = new ValidatePhoneCommand(_fakeAuthContext!, "123456");
            var guestEntity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_fakeAuthContext!.InvitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(_fakeAuthContext.GuestId),
                InvitationCode = _fakeAuthContext.InvitationCode,
                Phone = null
            };
        
            _mockDynamoDbProvider!
                .Setup(d => d.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(guestEntity);
        
            // Act
            Func<Task> act = async () => await Sut!.ExecuteAsync(command);
        
            // Assert
            await act.Should().ThrowAsync<ValidationException>()
                .WithMessage("Phone is null or empty.");
        }
        
        [Test]
        public async Task ValidatePhoneCommand_Should_Verify_When_Code_Is_Correct()
        {
            // Arrange
            var phone = "+12345678909";
            var code = "123456";
            var command = new ValidatePhoneCommand(_fakeAuthContext!, code);
            var guestEntity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_fakeAuthContext!.InvitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(_fakeAuthContext.GuestId),
                InvitationCode = _fakeAuthContext.InvitationCode,
                Phone = new VerifiedDto
                {
                    Value = phone,
                    Verified = false
                }.ToString()
            };
            var verifiedDto = new VerifiedDto { Value = phone, Verified = false, VerificationCode = code, VerificationCodeExpiration = DateTime.UtcNow.AddMinutes(5) };
        
            _mockDynamoDbProvider!
                .Setup(d => d.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(guestEntity);
        
            _mockTwilioSmsProvider!
                .Setup(t => t.CheckVerification(phone, code))
                .ReturnsAsync(true);
        
            _mockDynamoDbProvider
                .Setup(d => d.SaveAsync(It.IsAny<string>(), It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
        
            // Act
            var result = await Sut!.ExecuteAsync(command);
        
            // Assert
            result.Should().NotBeNull();
            _mockDynamoDbProvider!.Verify(x => 
                x.SaveAsync(It.IsAny<string>(), It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()), Times.Once);
            result.PhoneVerifyState.Verified.Should().BeTrue();
        }
        
        [Test]
        public async Task ValidatePhoneCommand_Should_Throw_When_Verification_Fails()
        {
            // Arrange
            var phone = "+12345678909";
            var code = "999999";
            var command = new ValidatePhoneCommand(_fakeAuthContext!, code);
            var guestEntity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_fakeAuthContext!.InvitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(_fakeAuthContext.GuestId),
                InvitationCode = _fakeAuthContext.InvitationCode,
                Phone = new VerifiedDto
                {
                    Value = phone,
                    Verified = false
                }.ToString()
            };
            //var guestEntity = new GuestEntity { Phone = "{ \"Value\": \"+1234567890\", \"VerificationCode\": \"123456\", \"VerificationCodeExpiration\": \"2025-12-31T23:59:59Z\" }" };
            //var verifiedDto = new VerifiedDto { Value = "+1234567890", Verified = false, VerificationCode = "123456", VerificationCodeExpiration = DateTime.UtcNow.AddMinutes(5) };
        
            _mockDynamoDbProvider!
                .Setup(d => d.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(guestEntity);
        
            _mockTwilioSmsProvider!
                .Setup(t => t.CheckVerification(It.IsAny<string>(), code))
                .ReturnsAsync(false);
        
            // Act
            Func<Task> act = async () => await Sut!.ExecuteAsync(command);
        
            // Assert
            await act.Should().ThrowAsync<ValidationException>()
                .WithMessage("Invalid verification code.");
        }
    }
}
