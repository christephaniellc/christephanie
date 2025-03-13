using System.Text.Json;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Dtos.ClientInfo;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Lambdas.User.Patch.Commands;
using Wedding.Lambdas.User.Patch.Handlers;

namespace Wedding.Lambdas.UnitTests.User.Patch
{
    [TestFixture]
    [UnitTestsFor(typeof(PatchUserHandler))]
    public class PatchUserHandlerTests
    {

        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;

        private AuthContext? _fakeAuthContext;

        private PatchUserHandler? Sut;

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


            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles),
                IpAddress = "127.0.0.1"
            };

            Sut = new PatchUserHandler(
                Mock.Of<ILogger<PatchUserHandler>>(),
                _mockDynamoDbProvider.Object,
                _mapper
            );
        }

        [Test]
        public async Task UpdateUserCommand_Should_Throw_When_Guest_Not_Found()
        {
            // Arrange
            var command = new PatchUserCommand(_fakeAuthContext!, new ClientInfoDto
            {
                IpAddress = "127.0.0.1"
            });

            _mockDynamoDbProvider!
                .Setup(d => d.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);

            // Act
            Func<Task> act = async () => await Sut!.ExecuteAsync(command);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage(
                    $"Could not find invitation {_fakeAuthContext.InvitationCode} with guestId {_fakeAuthContext.GuestId}. No items.");
        }

        [Test]
        public async Task UpdateUserCommand_Should_Update_Existing_ClientInfo_When_Similar_Exists()
        {
            // Arrange: Create a WeddingEntity with one ClientInfos entry that matches the new client's OS, Browser, and Screen.
            var existingClientInfo = new ClientInfoDto
            {
                Os = "Windows",
                Browser = new BrowserInfoDto { Name = "Chrome", Version = "91.0" },
                Screen = new ScreenInfoDto { Width = 1920, Height = 1080 },
                IpAddress = "127.0.0.1"
            };

            var weddingEntity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_fakeAuthContext.InvitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(_fakeAuthContext.GuestId),
                InvitationCode = _fakeAuthContext.InvitationCode,
                ClientInfos = new List<string>
                {
                    JsonSerializer.Serialize(existingClientInfo, new JsonSerializerOptions { PropertyNameCaseInsensitive = true, AllowTrailingCommas = true })
                }
            };

            _mockDynamoDbProvider
                .Setup(d => d.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(weddingEntity);

            // New client info has the same OS, browser and screen as the existing one.
            var newClientInfo = new ClientInfoDto
            {
                Os = "Windows",
                Browser = new BrowserInfoDto { Name = "Chrome", Version = "91.0" },
                Screen = new ScreenInfoDto { Width = 1920, Height = 1080 },
                IpAddress = "127.0.0.1" // Could also include updated fields (or different DateRecorded)
            };

            var command = new PatchUserCommand(_fakeAuthContext, newClientInfo);

            WeddingEntity savedEntity = null;
            _mockDynamoDbProvider
                .Setup(d => d.SaveAsync(It.IsAny<string>(), It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                .Callback<string, WeddingEntity, CancellationToken>((aud, ent, token) => savedEntity = ent)
                .Returns(Task.CompletedTask);

            // Act
            var result = await Sut.ExecuteAsync(command);

            // Assert
            result.Should().BeTrue();
            savedEntity.Should().NotBeNull();
            // Since the similar info was replaced, the ClientInfos list should still have one entry.
            savedEntity.ClientInfos.Should().HaveCount(1);
            // Deserialize the saved client info and verify it matches the new client info.
            var updatedClientInfo = JsonSerializer.Deserialize<ClientInfoDto>(savedEntity.ClientInfos.First(),
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true, AllowTrailingCommas = true });
            updatedClientInfo.Should().NotBeNull();
            updatedClientInfo.Os.Should().Be(newClientInfo.Os);
            updatedClientInfo.Browser.Name.Should().Be(newClientInfo.Browser.Name);
            updatedClientInfo.Browser.Version.Should().Be(newClientInfo.Browser.Version);
            updatedClientInfo.Screen.Width.Should().Be(newClientInfo.Screen.Width);
            updatedClientInfo.Screen.Height.Should().Be(newClientInfo.Screen.Height);
        }

        [Test]
        public async Task UpdateUserCommand_Should_Add_New_ClientInfo_When_None_Similar()
        {
            // Arrange: Create a WeddingEntity with one ClientInfos entry that does not match the new client's info.
            var existingClientInfo = new ClientInfoDto
            {
                Os = "macOS",
                Browser = new BrowserInfoDto { Name = "Safari", Version = "14.0" },
                Screen = new ScreenInfoDto { Width = 1280, Height = 800 },
                IpAddress = "192.168.0.1"
            };

            var weddingEntity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_fakeAuthContext.InvitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(_fakeAuthContext.GuestId),
                InvitationCode = _fakeAuthContext.InvitationCode,
                ClientInfos = new List<string>
                {
                    JsonSerializer.Serialize(existingClientInfo, new JsonSerializerOptions { PropertyNameCaseInsensitive = true, AllowTrailingCommas = true })
                }
            };

            _mockDynamoDbProvider
                .Setup(d => d.LoadGuestByGuestIdAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(weddingEntity);

            // New client info that does not match the existing one.
            var newClientInfo = new ClientInfoDto
            {
                Os = "Windows",
                Browser = new BrowserInfoDto { Name = "Chrome", Version = "91.0" },
                Screen = new ScreenInfoDto { Width = 1920, Height = 1080 },
                IpAddress = "127.0.0.1"
            };

            var command = new PatchUserCommand(_fakeAuthContext, newClientInfo);

            WeddingEntity savedEntity = null;
            _mockDynamoDbProvider
                .Setup(d => d.SaveAsync(It.IsAny<string>(), It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                .Callback<string, WeddingEntity, CancellationToken>((aud, ent, token) => savedEntity = ent)
                .Returns(Task.CompletedTask);

            // Act
            var result = await Sut.ExecuteAsync(command);

            // Assert
            result.Should().BeTrue();
            savedEntity.Should().NotBeNull();
            // Expect the new client info to be added alongside the existing entry.
            savedEntity.ClientInfos.Should().HaveCount(2);
            // Verify that one of the entries matches the new client info.
            var clientInfos = savedEntity.ClientInfos
                .Select(ci => JsonSerializer.Deserialize<ClientInfoDto>(ci, new JsonSerializerOptions { PropertyNameCaseInsensitive = true, AllowTrailingCommas = true }))
                .ToList();
            clientInfos.Any(ci =>
                   string.Equals(ci.Os, newClientInfo.Os, StringComparison.OrdinalIgnoreCase) &&
                   ci.Browser != null &&
                   string.Equals(ci.Browser.Name, newClientInfo.Browser.Name, StringComparison.OrdinalIgnoreCase) &&
                   string.Equals(ci.Browser.Version, newClientInfo.Browser.Version, StringComparison.OrdinalIgnoreCase) &&
                   ci.Screen != null &&
                   ci.Screen.Width == newClientInfo.Screen.Width &&
                   ci.Screen.Height == newClientInfo.Screen.Height)
                .Should().BeTrue();
        }
    }
}
