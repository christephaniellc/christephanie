using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System.Threading;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.Configuration.Invitation.Commands;
using Wedding.Lambdas.Admin.Configuration.Invitation.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.Configuration
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminConfigurationInvitationHandler))]
    public class AdminConfigurationInvitationHandlerTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;

        private AuthContext? _fakeAuthContext;
        private AdminConfigurationInvitationHandler? Sut;

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

            Sut = new AdminConfigurationInvitationHandler(Mock.Of<ILogger<AdminConfigurationInvitationHandler>>(), _mockDynamoDbProvider.Object, _mapper);
        }

        [Test]
        public async Task GetAsync_WithValidQuery_ShouldReturnMappedDto()
        {
            // Arrange
            var designId = Guid.NewGuid().ToString();
            var dto = new InvitationDesignDto
            {
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                DesignId = designId,
                Name = "Cool Theme",
                Orientation = OrientationEnum.Landscape,
                SeparatorWidth = 3,
                SeparatorColor = "#ffccdd",
                PhotoGridItems = new List<PhotoGridItemDto>()
            };

            _mockDynamoDbProvider!
                .Setup(x => x.GetPhotoConfigurationAsync(
                    _fakeAuthContext!.Audience,
                    _fakeAuthContext.GuestId,
                    designId,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<DesignConfigurationEntity>(dto));

            var query = new AdminGetPhotoConfigurationQuery(_fakeAuthContext!, designId);

            // Act
            var result = await Sut!.GetAsync(query);

            // Assert
            result.Should().NotBeNull();
            result.DesignId.Should().Be(designId);
            result.Name.Should().Be("Cool Theme");
        }

        [Test]
        public async Task GetAsync_WithMissingDesign_ShouldThrowUnauthorizedAccessException()
        {
            // Arrange
            var query = new AdminGetPhotoConfigurationQuery(_fakeAuthContext!, Guid.NewGuid().ToString());

            _mockDynamoDbProvider!
                .Setup(x => x.GetPhotoConfigurationAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync((DesignConfigurationEntity?)null);

            // Act
            Func<Task> act = async () => await Sut!.GetAsync(query);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("*Invitation design not found*");
        }
        [Test]
        public async Task GetAsync_WithGetAllQuery_ShouldReturnListOfDtos()
        {
            // Arrange
            var entities = new List<DesignConfigurationEntity>
            {
                new()
                {
                    PartitionKey = DynamoKeys.GetConfigurationPartitionKey(TestDataHelper.GUEST_JOHN.GuestId),
                    SortKey = DynamoKeys.GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum.Invitation, "1"),
                    GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                    DesignId = "1", Name = "Romantic",
                    ConfigurationData = new InvitationDesignDto { GuestId = TestDataHelper.GUEST_JOHN.GuestId }.ToString()
                },
                new() {
                    PartitionKey = DynamoKeys.GetConfigurationPartitionKey(TestDataHelper.GUEST_JOHN.GuestId),
                    SortKey = DynamoKeys.GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum.Invitation, "2"),
                    GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                    DesignId = "2", Name = "Minimalist",
                    ConfigurationData = new InvitationDesignDto { GuestId = TestDataHelper.GUEST_JOHN.GuestId }.ToString()
                }
            };

            _mockDynamoDbProvider!
                .Setup(x => x.GetPhotoConfigurationsAsync(_fakeAuthContext!.Audience, It.IsAny<CancellationToken>()))
                .ReturnsAsync(entities);

            var query = new AdminGetPhotoConfigurationsQuery(_fakeAuthContext!);

            // Act
            var result = await Sut!.GetAsync(query);

            // Assert
            result.Should().HaveCount(2);
            result.Select(x => x.DesignId).Should().Contain(new[] { "1", "2" });
        }

        [Test]
        public async Task ExecuteAsync_WithNewDesign_ShouldSaveAndReturnDto()
        {
            // Arrange
            var dto = new InvitationDesignDto
            {
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                DesignId = null,
                Name = "New Cool Theme",
                Orientation = OrientationEnum.Landscape,
                SeparatorWidth = 3,
                SeparatorColor = "#ffccdd",
                PhotoGridItems = new List<PhotoGridItemDto>()
            };

            DesignConfigurationEntity? savedDesign = null;

            _mockDynamoDbProvider!
                .Setup(x => x.SaveDesignAsync(_fakeAuthContext!.Audience, It.IsAny<DesignConfigurationEntity>(), It.IsAny<CancellationToken>()))
                .Callback<string, DesignConfigurationEntity, CancellationToken>((_, d, _) => savedDesign = d)
                .Returns(Task.CompletedTask);

            _mockDynamoDbProvider!
                .Setup(x => x.GetPhotoConfigurationAsync(_fakeAuthContext!.Audience, _fakeAuthContext.GuestId, It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(() => savedDesign!);

            var command = new AdminSavePhotoConfigurationCommand(_fakeAuthContext!, dto);

            // Act
            var result = await Sut!.ExecuteAsync(command);

            // Assert
            result.Should().NotBeNull();
            result.Name.Should().Be("New Cool Theme");
            result.DesignId.Should().NotBeNullOrWhiteSpace();
        }
        [Test]
        public async Task ExecuteAsync_WithExistingDesign_ShouldUpdateAndReturnDto()
        {
            // Arrange
            var designId = "existing123";
            var existing = new DesignConfigurationEntity
            {
                PartitionKey = DynamoKeys.GetConfigurationPartitionKey(TestDataHelper.GUEST_JOHN.GuestId),
                SortKey = DynamoKeys.GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum.Invitation, designId),
                DesignId = designId,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Name = "Old Name",
                ConfigurationData = null,
                DateCreated =  new LastUpdateAuditDto
                {
                    LastUpdate = DateTime.UtcNow,
                    Username = _fakeAuthContext.Name
                }.ToString()
        };

            var dto = new InvitationDesignDto
            {
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                DesignId = designId,
                Name = "Updated Name",
                Orientation = OrientationEnum.Landscape,
                SeparatorWidth = 3,
                SeparatorColor = "#ffccdd",
                PhotoGridItems = new List<PhotoGridItemDto>()
            };

            _mockDynamoDbProvider!
                .Setup(x => x.GetPhotoConfigurationAsync(_fakeAuthContext!.Audience, _fakeAuthContext.GuestId, designId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockDynamoDbProvider!
                .Setup(x => x.SaveDesignAsync(_fakeAuthContext.Audience, It.IsAny<DesignConfigurationEntity>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            var command = new AdminSavePhotoConfigurationCommand(_fakeAuthContext, dto);

            // Act
            var result = await Sut!.ExecuteAsync(command);

            // Assert
            result.Should().NotBeNull();
            result.Name.Should().Be("Updated Name");
            result.DesignId.Should().Be("existing123");
            result.SeparatorWidth.Should().Be(3);
        }

    }
}
