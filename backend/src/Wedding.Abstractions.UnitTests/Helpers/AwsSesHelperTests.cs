using Amazon.SimpleEmail.Model;
using Amazon.SimpleEmail;
using FluentAssertions;
using Moq;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Lambdas.UnitTests.TestData;
using Microsoft.Extensions.Configuration;

namespace Wedding.Abstractions.UnitTests.Helpers
{
    public class TestableAwsSesHelper : AwsSesHelper
    {
        private readonly IAmazonSimpleEmailService _fakeSesClient;

        public TestableAwsSesHelper(ApplicationConfiguration config, IAmazonSimpleEmailService fakeSesClient)
            : base(config)
        {
            _fakeSesClient = fakeSesClient;
        }

        protected override IAmazonSimpleEmailService CreateSesClient()
        {
            return _fakeSesClient;
        }
    }

    [UnitTestsFor(typeof(AwsSesHelper))]
    [TestFixture]
    public class AwsSesHelperTests
    {
        private ApplicationConfiguration _config;
        private Mock<IAmazonSimpleEmailService> _sesClientMock;
        private AuthContext? _fakeAuthContext;
        private TestTokenHelper? _testTokenHelper;
        private TestableAwsSesHelper _awsSesHelper;

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);

            _config = new ApplicationConfiguration
            {
                MailFromAddress = "no-reply@yourdomain.com"
            };

            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles),
                Name = TestDataHelper.GUEST_JOHN.FirstName + " " + TestDataHelper.GUEST_JOHN.LastName,
                IpAddress = "127.0.0.1"
            };

            _sesClientMock = new Mock<IAmazonSimpleEmailService>();

            _awsSesHelper = new TestableAwsSesHelper(_config, _sesClientMock.Object);
        }

        [Test]
        public async Task SendEmail_ShouldBuildRequestAndReturnResponse()
        {
            // Arrange
            var toAddresses = new List<string> { "recipient@example.com" };
            var subject = "Test Subject";
            var body = "Test Body";
            var fakeResponse = new SendEmailResponse { MessageId = "12345" };

            _sesClientMock
                .Setup(x => x.SendEmailAsync(It.IsAny<SendEmailRequest>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(fakeResponse);

            // Act
            var result = await _awsSesHelper.SendEmail(toAddresses, subject, body, body,CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result!.MessageId.Should().Be("12345");
            _sesClientMock.Verify(x => x.SendEmailAsync(
                It.Is<SendEmailRequest>(r =>
                    r.Source == _config.MailFromAddress &&
                    r.Destination.ToAddresses.SequenceEqual(toAddresses) &&
                    r.Message.Subject.Data == subject &&
                    r.Message.Body.Text.Data == body),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public async Task SendVerificationCode_ShouldCallSendEmailAndReturnResponse()
        {
            // Arrange
            var verifiedDto = new VerifiedDto
            {
                Value = "recipient@example.com",
                VerificationCode = "ABC123"
            };
            var fakeResponse = new SendEmailResponse { MessageId = "67890" };

            _sesClientMock
                .Setup(x => x.SendEmailAsync(It.IsAny<SendEmailRequest>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(fakeResponse);

            // Act
            var result = await _awsSesHelper.SendValidationEmail(_fakeAuthContext, verifiedDto, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result!.MessageId.Should().Be("67890");
            _sesClientMock.Verify(x => x.SendEmailAsync(
                It.Is<SendEmailRequest>(r =>
                    r.Source == _config.MailFromAddress &&
                    r.Destination.ToAddresses.Contains(verifiedDto.Value) &&
                    r.Message.Subject.Data.Contains("Wedding Email Verification Code") &&
                    r.Message.Body.Text.Data.Contains(verifiedDto.VerificationCode)),
                It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
