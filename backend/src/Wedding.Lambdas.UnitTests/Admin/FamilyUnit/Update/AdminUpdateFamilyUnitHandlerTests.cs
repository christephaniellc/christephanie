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
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminUpdateFamilyUnitHandler))]
    public class AdminUpdateFamilyUnitHandlerTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;

        private AuthContext? _fakeAuthContext;
        private AdminUpdateFamilyUnitHandler? Sut;

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
                cfg.AddProfiles(DesignConfigurationEntityToDtoMapping.Profiles());
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

            var roles = new List<RoleEnum>();
            roles.AddRange(TestDataHelper.GUEST_JOHN.Roles);
            roles.Add(RoleEnum.Admin);

            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", roles),
                Name = TestDataHelper.GUEST_JOHN.FirstName + " " + TestDataHelper.GUEST_JOHN.LastName,
                IpAddress = "127.0.0.1"
            };

            Sut = new AdminUpdateFamilyUnitHandler(Mock.Of<ILogger<AdminUpdateFamilyUnitHandler>>(), _mockDynamoDbProvider.Object, _mapper);
        }

        // [Test]
        // public async Task ExecuteAsync_ShouldUpdateFamilyUnitAndGuestsCorrectly()
        // {
        //     // Arrange
        //     var originalFamilyUnit = TestDataHelper.FAMILY_DOE with
        //     {
        //         Guests = new List<GuestDto>
        // {
        //     TestDataHelper.GUEST_JOHN with { FirstName = "Johnny" }, // updated
        //     TestDataHelper.GUEST_JANE with { FirstName = "Janey" },  // updated
        //     new GuestDto
        //     {
        //         GuestId = Guid.NewGuid().ToString(),
        //         InvitationCode = TestDataHelper.TEST_INVITATION_CODE,
        //         FirstName = "NewGuest",
        //         LastName = "Newbie",
        //         Roles = new List<RoleEnum> { RoleEnum.Guest },
        //         AgeGroup = AgeGroupEnum.Adult
        //     }
        // }
        //     };
        //
        //     var command = new AdminUpdateFamilyUnitCommand
        //     {
        //         AuthContext = _fakeAuthContext!,
        //         FamilyUnit = originalFamilyUnit
        //     };
        //
        //     var queryResultEntities = new List<WeddingEntity>
        //     {
        //         _mapper!.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE),
        //         _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN),
        //         _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE),
        //         _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_DELETE_ME)
        //     };
        //
        //     _mockDynamoDbProvider!.Setup(x =>
        //         x.FromQueryAsync(_fakeAuthContext!.Audience, TestDataHelper.TEST_INVITATION_CODE))
        //         .ReturnsAsync(queryResultEntities);
        //
        //     _mockDynamoDbProvider.Setup(x =>
        //         x.SaveAsync(_fakeAuthContext.Audience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
        //         .Returns(Task.CompletedTask);
        //
        //     _mockDynamoDbProvider.Setup(x =>
        //         x.DeleteAsync(_fakeAuthContext.Audience, TestDataHelper.TEST_INVITATION_CODE,
        //             It.Is<string>(k => k == DynamoKeys.GetGuestSortKey(TestDataHelper.GUEST_DELETE_ME.GuestId)),
        //             It.IsAny<CancellationToken>()));
        //
        //     // Act
        //     var result = await Sut!.ExecuteAsync(command);
        //
        //     // Assert
        //     result.Should().NotBeNull();
        //     result.Guests.Should().HaveCount(3);
        //     result.Guests.Should().ContainSingle(g => g.FirstName == "Johnny");
        //     result.Guests.Should().ContainSingle(g => g.FirstName == "Janey");
        //     result.Guests.Should().ContainSingle(g => g.FirstName == "NewGuest");
        //
        //     _mockDynamoDbProvider.Verify(x =>
        //         x.DeleteAsync(_fakeAuthContext.Audience, TestDataHelper.TEST_INVITATION_CODE,
        //             DynamoKeys.GetGuestSortKey(TestDataHelper.GUEST_DELETE_ME.GuestId),
        //             It.IsAny<CancellationToken>()), Times.Once);
        //
        //     _mockDynamoDbProvider.Verify(x =>
        //         x.SaveAsync(_fakeAuthContext.Audience,
        //             It.Is<WeddingEntity>(e => e.SortKey == DynamoKeys.FamilyInfo), It.IsAny<CancellationToken>()),
        //         Times.Once);
        // }

        [Test]
        public async Task PatchGuest_ShouldUpdateFieldsAndAudit_WhenValidChangesProvided()
        {
            // Arrange
            var updatedEmail = "new@email.com";
            var updatedPhone = "555-1234";

            var command = new AdminPatchGuestCommand(_fakeAuthContext!,
                TestDataHelper.GUEST_JOHN.InvitationCode,
                TestDataHelper.GUEST_JOHN.GuestId,
                updatedEmail,
                updatedPhone,
                InvitationResponseEnum.Interested,
                RsvpEnum.Attending,
                RsvpEnum.Declined,
                RsvpEnum.Attending
            );

            var existingGuestEntity = _mapper!.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN); 
            var updatedGuestEntity = _mapper!.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN);

            WeddingEntity? savedEntity = null;

            _mockDynamoDbProvider!.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_fakeAuthContext!.Audience, TestDataHelper.TEST_INVITATION_CODE,
                        TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(() => savedEntity ?? existingGuestEntity);

            _mockDynamoDbProvider.Setup(x =>
                    x.SaveAsync(It.IsAny<string>(), It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                .Callback<string, WeddingEntity, CancellationToken>((aud, ent, ct) =>
                {
                    savedEntity = ent;
                    updatedGuestEntity = ent; // update the "after-save" version
                })
                .Returns(Task.CompletedTask);

            // Act
            var result = await Sut!.ExecuteAsync(command);

            // Assert
            result.Should().NotBeNull();
            result.GuestId.Should().Be(TestDataHelper.GUEST_JOHN.GuestId);
            result.Rsvp!.InvitationResponse.Should().Be(InvitationResponseEnum.Interested);
            result.Rsvp!.Wedding.Should().Be(RsvpEnum.Attending);
            result.Rsvp!.RehearsalDinner.Should().Be(RsvpEnum.Attending);
            result.Rsvp!.FourthOfJuly.Should().Be(RsvpEnum.Declined);
            result.Email!.Value.Should().Be(updatedEmail);
            result.Email.Verified.Should().BeFalse();
            result.Phone!.Value.Should().Be(updatedPhone);
            result.Phone.Verified.Should().BeFalse();

            savedEntity.Should().NotBeNull();
            savedEntity!.InvitationResponseAudit.Should().NotBeNullOrEmpty();
            savedEntity.RsvpAudit.Should().NotBeNullOrEmpty();
        }
    }
}
