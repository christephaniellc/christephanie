using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Guest.MaskedValues.Get.Commands;
using Wedding.Lambdas.Guest.MaskedValues.Get.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Guest.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetGuestMaskedValueHandler))]
    public class GetGuestMaskedValuesHandlerTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private GetGuestMaskedValueHandler? _handler;
        private TestTokenHelper? _testTokenHelper;
		private AuthContext? _fakeAuthContext;

        [SetUp]
        public void SetUp()
        {
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
            });
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

			_mapper = config.CreateMapper();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();
            var logger = Mock.Of<ILogger<GetGuestMaskedValueHandler>>();

            _handler = new GetGuestMaskedValueHandler(logger, _mockDynamoDbProvider.Object, _mapper);

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
		}

        [Test]
        [TestCase(NotificationPreferenceEnum.Email, "test@example.com")]
        [TestCase(NotificationPreferenceEnum.Text, "+15551234567")]
        public async Task ExecuteAsync_Should_Return_Unmasked_Email_Value_wip(NotificationPreferenceEnum preferenceType, string expectedValue)
        {
            // Arrange
            var guestId = TestDataHelper.GUEST_JOHN.GuestId;
            var guestWithValue = TestDataHelper.GUEST_JOHN;
            
            if (preferenceType == NotificationPreferenceEnum.Email)
            {
                guestWithValue.Email = new VerifiedDto
                {
                    Value = expectedValue,
                    Verified = true
                };
            }
            else
            {
                guestWithValue.Phone = new VerifiedDto
                {
                    Value = expectedValue,
                    Verified = true
                };
            }

            var guestEntity = _mapper!.Map<WeddingEntity>(guestWithValue);

            _mockDynamoDbProvider!.Setup(x => x.LoadGuestByGuestIdAsync(
                    _fakeAuthContext!.Audience,
                    _fakeAuthContext.InvitationCode,
                    guestId,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(guestEntity);

            var command = new GetMaskedValueCommand(_fakeAuthContext, guestId, preferenceType);

            // Act
            var result = await _handler!.ExecuteAsync(command);

            // Assert
            result.Should().Be(expectedValue);

            // Verify DB call was made with correct parameters
            _mockDynamoDbProvider.Verify(x => x.LoadGuestByGuestIdAsync(
                _fakeAuthContext.Audience,
                _fakeAuthContext.InvitationCode,
                guestId,
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public async Task ExecuteAsync_Should_Throw_UnauthorizedAccessException_When_GuestNotFound_wip()
        {
            // Arrange
            var nonExistentGuestId = Guid.NewGuid().ToString();

            _mockDynamoDbProvider!.Setup(x => x.LoadGuestByGuestIdAsync(
                    _fakeAuthContext!.Audience,
                    _fakeAuthContext.InvitationCode,
                    nonExistentGuestId,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);

            var command = new GetMaskedValueCommand(_fakeAuthContext, nonExistentGuestId, NotificationPreferenceEnum.Email);

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(async () => 
                await _handler!.ExecuteAsync(command));

            // Verify DB call was made with correct parameters
            _mockDynamoDbProvider.Verify(x => x.LoadGuestByGuestIdAsync(
                _fakeAuthContext.Audience,
                _fakeAuthContext.InvitationCode,
                nonExistentGuestId,
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public async Task ExecuteAsync_Should_Throw_ValidationException_When_InvalidMaskedValueType_wip()
        {
            // Arrange
            var guestId = TestDataHelper.GUEST_JOHN.GuestId;
            var guestEntity = _mapper!.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN);

            _mockDynamoDbProvider!.Setup(x => x.LoadGuestByGuestIdAsync(
                    _fakeAuthContext!.Audience,
                    _fakeAuthContext.InvitationCode,
                    guestId,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(guestEntity);

            // Use an invalid masked value type by casting an invalid value
            var invalidMaskedValueType = (NotificationPreferenceEnum)999;
            var command = new GetMaskedValueCommand(_fakeAuthContext, guestId, invalidMaskedValueType);

            // Act & Assert
            Assert.ThrowsAsync<FluentValidation.ValidationException>(async () => 
                await _handler!.ExecuteAsync(command));

            // Verify DB call was made with correct parameters
            _mockDynamoDbProvider.Verify(x => x.LoadGuestByGuestIdAsync(
                _fakeAuthContext.Audience,
                _fakeAuthContext.InvitationCode,
                guestId,
                It.IsAny<CancellationToken>()), Times.Never);
        }
    }
}