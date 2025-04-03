using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Patch.Commands;
using Wedding.Lambdas.FamilyUnit.Patch.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Patch
{
    [TestFixture]
    [UnitTestsFor(typeof(PatchFamilyUnitHandler))]
    public class PatchFamilyUnitHandlerTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;

        private AuthContext? _fakeAuthContext;
        private PatchFamilyUnitHandler? Sut;

        [SetUp]
        public void SetUp()
        {
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();

            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            
            _mapper = MappingProfileHelper.GetMapper();

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

            Sut = new PatchFamilyUnitHandler(Mock.Of<ILogger<PatchFamilyUnitHandler>>(), _mockDynamoDbProvider.Object, _mapper);
        }

        [Test]
        public async Task ExecuteAsync_Should_UpdateAndReturnFamilyUnit_When_CommandIsValid()
        {
            // ARRANGE
            var invitationCode = TestDataHelper.FAMILY_DOE.InvitationCode;
            var existingEntity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(invitationCode),
                SortKey = DynamoKeys.GetFamilyInfoSortKey(),
                InvitationCode = invitationCode,
                MailingAddress = TestDataHelper.FAMILY_DOE.MailingAddress!.ToString(),
                InvitationResponseNotes = "Old notes"
            };

            var newAddress = new AddressDto
            {
                StreetAddress = "2342 Wedding Dr.",
                City = "Washington",
                State = "DC",
                ZIPCode = "20010"
            };
            var command = new PatchFamilyUnitCommand(_fakeAuthContext!, newAddress, "New notes");

            _mockDynamoDbProvider!
                .Setup(x => x.LoadFamilyUnitOnlyAsync(_testTokenHelper!.JwtAudience, invitationCode, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEntity);

            _mockDynamoDbProvider
                .Setup(x => x.SaveAsync(_testTokenHelper!.JwtAudience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            var updatedEntity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(invitationCode),
                SortKey = DynamoKeys.GetFamilyInfoSortKey(),
                InvitationCode = invitationCode,
                MailingAddress = command.MailingAddress!.ToString(), // updated address from command
                InvitationResponseNotes = command.InvitationResponseNotes
            };
            var updatedDto = _mapper!.Map<FamilyUnitDto>(updatedEntity);

            _mockDynamoDbProvider
                .Setup(x => x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, invitationCode, It.IsAny<CancellationToken>()))
                .ReturnsAsync(updatedDto);

            var expectedViewModel = new FamilyUnitViewModel
            {
                InvitationCode = invitationCode,
                MailingAddress = updatedDto.MailingAddress,
                InvitationResponseNotes = "New notes"
            };

            // Act
            var result = await Sut!.ExecuteAsync(command);

            // Assert
            result.Should().NotBeNull();
            result.InvitationCode.Should().Be(invitationCode);
            result.MailingAddress.Should().Be(expectedViewModel.MailingAddress);
            result.InvitationResponseNotes.Should().Be(expectedViewModel.InvitationResponseNotes);

            _mockDynamoDbProvider.Verify(x => x.SaveAsync(_testTokenHelper!.JwtAudience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()), Times.Once);
            _mockDynamoDbProvider.Verify(x => x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, invitationCode, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        public void ExecuteAsync_Should_ThrowInvalidOperationException_When_FamilyUnitNotFound()
        {
            // Arrange
            var invitationCode = TestDataHelper.FAMILY_DOE.InvitationCode;
            _mockDynamoDbProvider!
                .Setup(x => x.LoadFamilyUnitOnlyAsync(_testTokenHelper!.JwtAudience, invitationCode, It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);

            var command = new PatchFamilyUnitCommand(_fakeAuthContext!, null, "new notes");

            // Act
            Func<Task> act = async () => await Sut!.ExecuteAsync(command);

            // Assert
            act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage($"Family unit with Invitation code '{invitationCode}' does not exist.");
        }
    }
}
