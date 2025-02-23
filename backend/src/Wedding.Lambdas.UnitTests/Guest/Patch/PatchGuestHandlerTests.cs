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
using Wedding.Lambdas.Guest.Patch.Commands;
using Wedding.Lambdas.Guest.Patch.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Guest.Patch
{
    [TestFixture]
    [UnitTestsFor(typeof(PatchGuestHandler))]
    public class PatchGuestHandlerTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;

        private AuthContext? _fakeAuthContext;
        private PatchGuestHandler? Sut;

        [SetUp]
        public void SetUp()
        {
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();

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

            _mockDynamoDbProvider.Setup(x =>
                    x.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JANE.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE));

            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles),
                Name = TestDataHelper.GUEST_JOHN.FirstName + " " + TestDataHelper.GUEST_JOHN.LastName,
                IpAddress = "127.0.0.1"
            };

            Sut = new PatchGuestHandler(Mock.Of<ILogger<PatchGuestHandler>>(), _mockDynamoDbProvider.Object, _mapper);
        }

        [Test]
        public async Task ExecuteAsync_Should_UpdateAndReturnGuest_When_CommandIsValid()
        {
            // ARRANGE
            var invitationCode = TestDataHelper.FAMILY_DOE.InvitationCode;
            var guestId = TestDataHelper.GUEST_JOHN.GuestId;
            var newEmail = "newemail@gmail.com";

            var mutableDto = TestDataHelper.GUEST_JOHN;

            var command = new PatchGuestCommand(_fakeAuthContext!, guestId, Email: newEmail, Wedding: RsvpEnum.Attending);

            _mockDynamoDbProvider!
                .Setup(x => x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, invitationCode, guestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper!.Map<WeddingEntity>(mutableDto));

            _mockDynamoDbProvider!
                .Setup(x => x.SaveAsync(_testTokenHelper!.JwtAudience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                .Callback<string, WeddingEntity, CancellationToken>((aud, updatedEntity, ct) =>
                {
                    mutableDto = _mapper.Map<GuestDto>(updatedEntity);
                })
                .Returns(Task.CompletedTask);

            _mockDynamoDbProvider!
                .Setup(x => x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, guestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(() => _mapper.Map<WeddingEntity>(mutableDto));

            // Act
            var result = await Sut!.ExecuteAsync(command);

            // Assert
            result.Should().NotBeNull();
            result.InvitationCode.Should().Be(invitationCode);
            result.Email!.Value.Should().Be(newEmail);
            result.Email.Verified.Should().Be(false);
            result.Rsvp!.Wedding.Should().Be(RsvpEnum.Attending);

            _mockDynamoDbProvider.Verify(x => x.SaveAsync(_testTokenHelper!.JwtAudience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()), Times.Once);
            _mockDynamoDbProvider.Verify(x => x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, invitationCode, guestId, It.IsAny<CancellationToken>()), Times.Exactly(2));
        }

        [Test]
        public async Task ExecuteAsync_Should_UpdateFoodPreferences()
        {
            // ARRANGE
            var invitationCode = TestDataHelper.FAMILY_DOE.InvitationCode;
            var guestId = TestDataHelper.GUEST_JOHN.GuestId;

            var mutableDto = TestDataHelper.GUEST_JOHN;

            var command = new PatchGuestCommand(_fakeAuthContext!, guestId, FoodPreference: FoodPreferenceEnum.Omnivore, FoodAllergies: new List<string>{"Gluten"});

            _mockDynamoDbProvider!
                .Setup(x => x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, invitationCode, guestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper!.Map<WeddingEntity>(mutableDto));

            _mockDynamoDbProvider!
                .Setup(x => x.SaveAsync(_testTokenHelper!.JwtAudience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                .Callback<string, WeddingEntity, CancellationToken>((aud, updatedEntity, ct) =>
                {
                    mutableDto = _mapper.Map<GuestDto>(updatedEntity);
                })
                .Returns(Task.CompletedTask);

            _mockDynamoDbProvider!
                .Setup(x => x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, guestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(() => _mapper.Map<WeddingEntity>(mutableDto));

            // Act
            var result = await Sut!.ExecuteAsync(command);

            // Assert
            result.Should().NotBeNull();
            result.InvitationCode.Should().Be(invitationCode);
            result.Preferences!.FoodPreference.Should().Be(FoodPreferenceEnum.Omnivore);
            result.Preferences!.FoodAllergies.Should().Contain("Gluten");

            _mockDynamoDbProvider.Verify(x => x.SaveAsync(_testTokenHelper!.JwtAudience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()), Times.Once);
            _mockDynamoDbProvider.Verify(x => x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, invitationCode, guestId, It.IsAny<CancellationToken>()), Times.Exactly(2));
        }
    }
}
