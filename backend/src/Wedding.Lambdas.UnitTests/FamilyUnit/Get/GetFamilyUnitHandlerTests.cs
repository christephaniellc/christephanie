using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Get.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetFamilyUnitHandler))]
    public class GetFamilyUnitHandlerTests
    {
        private Mock<IDynamoDBProvider> _dynamoDbProviderMock;
        private Mock<IMapper> _mapperMock;
        private Mock<ILogger<GetFamilyUnitHandler>> _loggerMock;
        private GetFamilyUnitHandler _handler;
        private GetFamilyUnitQuery _query;

        private TestTokenHelper? _testTokenHelper;
        private AuthContext? _fakeAuthContext;

        [SetUp]
        public void Setup()
        {
            _dynamoDbProviderMock = new Mock<IDynamoDBProvider>();
            _mapperMock = new Mock<IMapper>();
            _loggerMock = new Mock<ILogger<GetFamilyUnitHandler>>();
            _handler = new GetFamilyUnitHandler(_loggerMock.Object, _dynamoDbProviderMock.Object, _mapperMock.Object);

            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);

            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                GuestId = Guid.Parse("11111111-1111-1111-1111-111111111111").ToString(),
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles),
                Name = TestDataHelper.GUEST_JOHN.FirstName + " " + TestDataHelper.GUEST_JOHN.LastName,
                IpAddress = "127.0.0.1"
            };
            _query = new GetFamilyUnitQuery(_fakeAuthContext);
        }

        [Test]
        public async Task Guests_Are_Sorted_Correctly_With_LoggedInGuest_Pending_And_Others()
        {
            // Arrange
            // Create guests:
            // - guestLoggedIn: the logged-in guest.
            // - guestPending: pending response.
            // - guestOther1 & guestOther2: non-pending responses.
            var loggedInGuestId = _query.AuthContext.GuestId;
            var guestOther1 = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 3,
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Interested },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };
            var guestLoggedIn = new GuestDto
            {
                GuestId = loggedInGuestId,
                GuestNumber = 5,
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Interested },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };
            var guestPending = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 2,
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Pending },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };
            var guestOther2 = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 1,
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Declined },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            var familyUnit = new FamilyUnitDto
            {
                Guests = new List<GuestDto> { guestOther1, guestLoggedIn, guestPending, guestOther2 }
            };

            // Setup provider to return our family unit.
            _dynamoDbProviderMock.Setup(x =>
                x.GetFamilyUnitAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(familyUnit);

            // For testing purposes, let the mapper simply pass through the guests order.
            _mapperMock.Setup(x => x.Map<FamilyUnitViewModel>(It.IsAny<FamilyUnitDto>()))
                .Returns((FamilyUnitDto f) => new FamilyUnitViewModel { Guests = f.Guests });

            // Act
            var result = await _handler.GetAsync(_query);

            // Assert
            // Expected sort order:
            // 1. Logged in guest (guestLoggedIn) comes first.
            // 2. Next, pending guests (only guestPending exists here).
            // 3. Finally, the remaining guests sorted by GuestNumber in ascending order (guestOther2 then guestOther1).
            Assert.AreEqual(loggedInGuestId, result.Guests[0].GuestId);
            Assert.AreEqual(InvitationResponseEnum.Pending, result.Guests[1].Rsvp.InvitationResponse);
            Assert.AreEqual(1, result.Guests[2].GuestNumber);
            Assert.AreEqual(3, result.Guests[3].GuestNumber);
        }

        [Test]
        public async Task Pending_Guests_Are_Sorted_By_GuestNumber_When_No_LoggedInGuest_Is_Found_But_Admin_Access()
        {
            // Arrange
            // In this test we simulate an admin making the request.
            _query.AuthContext.Roles = "Admin";

            // None of the guests is the logged-in guest.
            var guestPending1 = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 5,
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Pending },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };
            var guestPending2 = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 2,
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Pending },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };
            var guestPending3 = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 7,
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Pending },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            var familyUnit = new FamilyUnitDto
            {
                Guests = new List<GuestDto> { guestPending1, guestPending2, guestPending3 }
            };

            _dynamoDbProviderMock.Setup(x =>
                x.GetFamilyUnitAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(familyUnit);

            _mapperMock.Setup(x => x.Map<FamilyUnitViewModel>(It.IsAny<FamilyUnitDto>()))
                .Returns((FamilyUnitDto f) => new FamilyUnitViewModel { Guests = f.Guests });

            // Act
            var result = await _handler.GetAsync(_query);

            // Assert
            // Since all guests are pending, they should be ordered by GuestNumber ascending.
            Assert.AreEqual(2, result.Guests[0].GuestNumber);
            Assert.AreEqual(5, result.Guests[1].GuestNumber);
            Assert.AreEqual(7, result.Guests[2].GuestNumber);
        }

        [Test]
        public void Throws_UnauthorizedAccessException_When_LoggedInGuest_Not_Found_And_All_Responses_Pending_For_Non_Admin()
        {
            // Arrange
            // All guests are pending and none matches the logged-in guest,
            // so a non-admin request should result in unauthorized access.
            var guestPending1 = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 1,
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Pending },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };
            var guestPending2 = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 2,
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Pending },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            var familyUnit = new FamilyUnitDto
            {
                Guests = new List<GuestDto> { guestPending1, guestPending2 }
            };

            _dynamoDbProviderMock.Setup(x =>
                x.GetFamilyUnitAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(familyUnit);

            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _handler.GetAsync(_query));
            Assert.AreEqual("Access denied", ex.Message);
        }
    }
}