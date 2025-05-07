using Amazon.SimpleEmail.Model;
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
using Wedding.Lambdas.Notify.Email.Commands;
using Wedding.Lambdas.Notify.Email.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Notifications
{
    [TestFixture]
    [UnitTestsFor(typeof(SendEmailNotificationHandler))]
    public class SendEmailNotificationHandlerTests
    {
        private SendEmailNotificationHandler _handler;
        private Mock<ILogger<SendEmailNotificationHandler>> _loggerMock;
        private Mock<IDynamoDBProvider> _dynamoDbProviderMock;
        private IMapper? _mapper;
        private TestTokenHelper? _testTokenHelper;
        private AuthContext? _fakeAuthContext;
        private Mock<IAwsSesHelper>? _mockAwsSesHelper;

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _loggerMock = new Mock<ILogger<SendEmailNotificationHandler>>();
            _dynamoDbProviderMock = new Mock<IDynamoDBProvider>();
            _mockAwsSesHelper = new Mock<IAwsSesHelper>();

            _mapper = MappingProfileHelper.GetMapper();

            _handler = new SendEmailNotificationHandler(
                _loggerMock.Object,
                _dynamoDbProviderMock.Object,
                _mapper,
                _mockAwsSesHelper.Object);

            var familyDoeWithOneVerifiedEmail = TestDataHelper.FAMILY_DOE;
            familyDoeWithOneVerifiedEmail.Guests[0].Email.Verified = true;

            var families = new List<FamilyUnitDto>
            {
                familyDoeWithOneVerifiedEmail
            };

            _dynamoDbProviderMock.Setup(x =>
                    x.GetFamilyUnitsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(families);

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
        public async Task Should_Send_Email_And_Log_Notification_Successfully()
        {
            // Arrange
            var sendResponse = new SendEmailResponse
            {
                MessageId = "msg-123"
            };

            var guest = TestDataHelper.GUEST_JOHN;
            guest.Email = new VerifiedDto
            {
                Value = "john@example.com",
                Verified = true
            };

            var command = new SendRsvpNotificationCommand(_fakeAuthContext, null);

            _mockAwsSesHelper = new Mock<IAwsSesHelper>();
            _mockAwsSesHelper
                .Setup(x => x.SendRsvpNotificationEmail(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<bool>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(sendResponse);

            _handler = new SendEmailNotificationHandler(
                _loggerMock.Object,
                _dynamoDbProviderMock.Object,
                _mapper,
                _mockAwsSesHelper.Object);

            NotificationDataEntity? savedEntity = null;
            _dynamoDbProviderMock
                .Setup(x => x.SaveNotificationAsync(It.IsAny<string>(), It.IsAny<NotificationDataEntity>(), It.IsAny<CancellationToken>()))
                .Callback<string, NotificationDataEntity, CancellationToken>((aud, ent, token) =>
                {
                    savedEntity = ent;
                })
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.ExecuteAsync(command);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);

            var log = result.First();
            log.EmailAddress.Should().Be("john.doe@gmail.com");
            log.DeliveryStatus.Should().Be("SUCCESS");
            log.CampaignType.Should().Be(CampaignTypeEnum.RsvpNotify);
            log.GuestId.Should().Be(guest.GuestId);
            log.Verified.Should().BeTrue();
            log.GuestEmailLogId.Should().Be("msg-123");

            savedEntity.Should().NotBeNull();
            savedEntity!.GuestId.Should().Be(guest.GuestId);
            savedEntity.EmailType.Should().Be(CampaignTypeEnum.RsvpNotify);
            savedEntity.DeliveryStatus.Should().Be("SUCCESS");
            savedEntity.EmailAddress.Should().Be("john.doe@gmail.com");
        }

        [Test]
        public async Task Should_Send_Email_And_Log_Success()
        {
            // Arrange
            SetupMockGuest(withVerifiedEmail: true);
            SetupMockSes(success: true);

            var command = new SendRsvpNotificationCommand(_fakeAuthContext);

            NotificationDataEntity? savedEntity = null;
            _dynamoDbProviderMock.Setup(x => x.SaveNotificationAsync(It.IsAny<string>(), It.IsAny<NotificationDataEntity>(), It.IsAny<CancellationToken>()))
                .Callback<string, NotificationDataEntity, CancellationToken>((aud, entity, token) => savedEntity = entity)
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.ExecuteAsync(command);

            // Assert
            result.Should().NotBeNull().And.HaveCount(1);
            result[0].DeliveryStatus.Should().Be("SUCCESS");
            savedEntity.Should().NotBeNull();
            savedEntity!.EmailType.Should().Be(CampaignTypeEnum.RsvpNotify);
        }

        [Test]
        public async Task Should_Log_Failed_Email_If_SES_Fails()
        {
            // Arrange
            SetupMockGuest(withVerifiedEmail: true);
            SetupMockSes(success: false); // returns null

            var command = new SendRsvpNotificationCommand(_fakeAuthContext);

            NotificationDataEntity? savedEntity = null;
            _dynamoDbProviderMock.Setup(x => x.SaveNotificationAsync(It.IsAny<string>(), It.IsAny<NotificationDataEntity>(), It.IsAny<CancellationToken>()))
                .Callback<string, NotificationDataEntity, CancellationToken>((aud, entity, token) => savedEntity = entity)
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.ExecuteAsync(command);

            // Assert
            result.Should().NotBeNull().And.HaveCount(1);
            result[0].DeliveryStatus.Should().Be("FAILED");
            savedEntity.Should().NotBeNull();
            savedEntity!.DeliveryStatus.Should().Be("FAILED");
        }

        [Test]
        public void Should_Throw_If_No_Guests_Found()
        {
            _dynamoDbProviderMock.Setup(x => x.GetFamilyUnitsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<FamilyUnitDto>()); // empty list

            var command = new SendRsvpNotificationCommand(_fakeAuthContext);

            Func<Task> act = async () => await _handler.ExecuteAsync(command);

            act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("*Guests with emails not found*");
        }

        [Test]
        public async Task Should_Not_Send_Email_If_Email_Not_Verified()
        {
            SetupMockGuest(withVerifiedEmail: false);
            SetupMockSes(success: true);

            var command = new SendRsvpNotificationCommand(_fakeAuthContext);

            var result = await _handler.ExecuteAsync(command);

            result.Should().BeEmpty();
            _mockAwsSesHelper.Verify(x => x.SendRsvpNotificationEmail(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Test]
        public async Task Should_Process_Multiple_Guests()
        {
            var family = TestDataHelper.FAMILY_DOE;
            var verifiedJohn = TestDataHelper.GUEST_JOHN;
            verifiedJohn.Email.Verified = true;
            var verifiedJane = TestDataHelper.GUEST_JANE;
            verifiedJane.Email.Verified = true;

            family.Guests = new List<GuestDto>
            {
                verifiedJohn,
                verifiedJane
            };

            _dynamoDbProviderMock.Setup(x => x.GetFamilyUnitsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<FamilyUnitDto> { family });

            SetupMockSes(success: true);

            var command = new SendRsvpNotificationCommand(_fakeAuthContext);

            var result = await _handler.ExecuteAsync(command);

            result.Should().HaveCount(2);
            result.All(r => r.DeliveryStatus == "SUCCESS").Should().BeTrue();
        }

        private void SetupMockGuest(bool withVerifiedEmail)
        {
            var guest = TestDataHelper.GUEST_JOHN;
            guest.Email = new VerifiedDto
            {
                Value = withVerifiedEmail ? "john@example.com" : null,
                Verified = withVerifiedEmail
            };

            var family = TestDataHelper.FAMILY_DOE;
            family.Guests = new List<GuestDto> { guest };

            _dynamoDbProviderMock.Setup(x => x.GetFamilyUnitsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<FamilyUnitDto> { family });
        }

        private void SetupMockSes(bool success)
        {
            _mockAwsSesHelper = new Mock<IAwsSesHelper>();
            _mockAwsSesHelper.Setup(x => x.SendRsvpNotificationEmail(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<bool>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(success ? new SendEmailResponse { MessageId = "msg-abc" } : null);

            _handler = new SendEmailNotificationHandler(
                _loggerMock.Object,
                _dynamoDbProviderMock.Object,
                _mapper!,
                _mockAwsSesHelper.Object);
        }
    }
}
