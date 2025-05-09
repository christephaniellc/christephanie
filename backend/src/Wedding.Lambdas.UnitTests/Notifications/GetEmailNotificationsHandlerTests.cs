using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Notify.Email.Handlers;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Abstractions.Enums;
using Wedding.Lambdas.Notify.Email.Commands;

namespace Wedding.Lambdas.UnitTests.Notifications
{
    [TestFixture]
    [UnitTestsFor(typeof(GetEmailNotificationsHandler))]
    public class GetEmailNotificationsHandlerTests
    {
        private GetEmailNotificationsHandler Sut;
        private Mock<ILogger<GetEmailNotificationsHandler>> _loggerMock;
        private Mock<IDynamoDBProvider> _dynamoDbProviderMock;
        private IMapper? _mapper;
        private TestTokenHelper? _testTokenHelper;
        private AuthContext? _fakeAuthContext;

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _loggerMock = new Mock<ILogger<GetEmailNotificationsHandler>>();
            _dynamoDbProviderMock = new Mock<IDynamoDBProvider>();

            _mapper = MappingProfileHelper.GetMapper();

            Sut = new GetEmailNotificationsHandler(
                _loggerMock.Object,
                _dynamoDbProviderMock.Object,
                _mapper);

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
        public async Task Should_Return_One_Email_Log_Per_Campaign()
        {
            var query = new GetEmailNotificationsQuery(_fakeAuthContext!);

            foreach (CampaignTypeEnum campaign in Enum.GetValues(typeof(CampaignTypeEnum)))
            {
                var fakeLog = new GuestEmailLogDto
                {
                    GuestEmailLogId = $"msg-{campaign}",
                    GuestId = "guest123",
                    CampaignType = campaign,
                    EmailAddress = $"{campaign}@example.com",
                    Verified = true,
                    DeliveryStatus = "SUCCESS",
                    Timestamp = DateTime.UtcNow.ToString("o"),
                    Metadata = new Dictionary<string, string> { { "CampaignMeta", "Value" } }
                };

                _dynamoDbProviderMock.Setup(x =>
                        x.GetEmailLogsByCampaignTypeAsync(_fakeAuthContext!.Audience, campaign, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(new List<GuestEmailLogDto> { fakeLog });
            }

            var result = await Sut.GetAsync(query);

            result.Should().NotBeNull();
            result.Should().HaveCount(Enum.GetValues(typeof(CampaignTypeEnum)).Length);

            foreach (var campaign in Enum.GetValues(typeof(CampaignTypeEnum)))
            {
                var campaignEnum = (CampaignTypeEnum)campaign;
                result.Should().ContainKey(campaignEnum);
                result[campaignEnum].FirstOrDefault().CampaignType.Should().Be(campaignEnum);
            }
        }

        [Test]
        public async Task Should_Return_Empty_Dictionary_When_No_Notifications_Exist()
        {
            var query = new GetEmailNotificationsQuery(_fakeAuthContext!);

            foreach (CampaignTypeEnum campaign in Enum.GetValues(typeof(CampaignTypeEnum)))
            {
                _dynamoDbProviderMock.Setup(x =>
                        x.GetEmailLogsByCampaignTypeAsync(_fakeAuthContext!.Audience, campaign, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(new List<GuestEmailLogDto>()); // empty list
            }

            var result = await Sut.GetAsync(query);

            result.Should().NotBeNull().And.BeEmpty();
        }

        [Test]
        public void Should_Log_And_Throw_When_Provider_Fails()
        {
            var query = new GetEmailNotificationsQuery(_fakeAuthContext!);

            _dynamoDbProviderMock.Setup(x =>
                    x.GetEmailLogsByCampaignTypeAsync(It.IsAny<string>(), It.IsAny<CampaignTypeEnum>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Dynamo failure"));

            Func<Task> act = async () => await Sut.GetAsync(query);

            act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("*Notifications not found*");

            _loggerMock.VerifyLogged(LogLevel.Error, "An error occurred while getting the notifications", Times.Once());
        }

    }
}
