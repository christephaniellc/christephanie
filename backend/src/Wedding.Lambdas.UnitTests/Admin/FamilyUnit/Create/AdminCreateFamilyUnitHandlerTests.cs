using AutoMapper;
using FluentAssertions;
using FluentValidation;
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
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Create
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminCreateFamilyUnitHandler))]
    public class AdminCreateFamilyUnitHandlerTests
    {
        private Mock<ILogger<AdminCreateFamilyUnitHandler>>? _loggerMock;
        private Mock<IDynamoDBProvider>? _dynamoProviderMock;
        private AdminCreateFamilyUnitHandler? _handler;
        private IMapper? _mapper;
        private TestTokenHelper? _testTokenHelper;

        [SetUp]
        public void SetUp()
        {
            _mapper = MappingProfileHelper.GetMapper();

            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);

            _loggerMock = new Mock<ILogger<AdminCreateFamilyUnitHandler>>();
            _dynamoProviderMock = new Mock<IDynamoDBProvider>();
            _handler = new AdminCreateFamilyUnitHandler(_loggerMock.Object, _dynamoProviderMock.Object, _mapper);
        }

        [Test]
        public Task ExecuteAsync_Should_Not_Save_When_FamilyUnit_Already_Exists()
        {
            // Arrange
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto>() 
                {
                    new FamilyUnitDto
                    {
                        InvitationCode = "ABCDE",
                        Tier = "A",
                        Guests = new List<GuestDto>
                        {
                            new GuestDto
                            {
                                FirstName = "John",
                                LastName = "Doe", Roles = new List<RoleEnum> { RoleEnum.Guest }
                            }
                        }
                    }},
                    new AuthContext
                    {
                        Audience = _testTokenHelper!.JwtAudience,
                        GuestId = Guid.NewGuid().ToString(),
                        InvitationCode = "CCCCC",
                        Roles = string.Join(',', new List<RoleEnum> { RoleEnum.Admin }),
                        IpAddress = "127.0.0.1"
                    }
            );

            var existingFamilyUnit = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey("ABCDE"),
                InvitationCode = "ABCDE",
                SortKey = DynamoKeys.GetFamilyInfoSortKey()
            };

            _dynamoProviderMock!.Setup(r => r.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience, command.FamilyUnits[0].InvitationCode,It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingFamilyUnit);

            // Act & Assert
            Assert.DoesNotThrowAsync(async () => await _handler!.ExecuteAsync(command));
            _dynamoProviderMock.Verify(r => r.SaveAsync(command.AuthContext.Audience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()), Times.Exactly(0));
            return Task.CompletedTask;
        }

        [Test]
        public Task ExecuteAsync_Should_Throw_Exception_When_NotAdmin()
        {
            // Arrange
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto>()
                    {
                new FamilyUnitDto
                {
                    InvitationCode = "BBCDE",
                    Tier = "A",
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            FirstName = "Horst",
                            LastName = "Klu", Roles = new List<RoleEnum> { RoleEnum.Guest }
                        }
                    }
                }},
                new AuthContext
                {
                    Audience = _testTokenHelper!.JwtAudience,
                    GuestId = Guid.NewGuid().ToString(),
                    InvitationCode = "ABCDE",
                    Roles = string.Join(',', new List<RoleEnum> { RoleEnum.Guest }),
                    IpAddress = "127.0.0.1"
                }
            );

            // Act & Assert
            var ex = Assert.ThrowsAsync<ValidationException>(async () => await _handler!.ExecuteAsync(command));
            Assert.That(ex!.Message, Does.Contain("AuthContext: No admin permissions."));
            return Task.CompletedTask;
        }

        [Test]
        public async Task ExecuteAsync_Should_Save_FamilyUnit_And_Guests()
        {
            // Arrange
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto>()
                    {
                        new FamilyUnitDto
                        {
                            InvitationCode = "ABCDE",
                            Tier = "A",
                            Guests = new List<GuestDto>
                            {
                                new GuestDto { FirstName = "John", LastName = "Doe", Roles = new List<RoleEnum> { RoleEnum.Guest } },
                                new GuestDto { FirstName = "Jane", LastName = "Doe", Roles = new List<RoleEnum> { RoleEnum.Guest, RoleEnum.Manor } }
                            }
                        }},
                        new AuthContext
                        {
                            Audience = _testTokenHelper!.JwtAudience,
                            GuestId = Guid.NewGuid().ToString(),
                            InvitationCode = "CCCCC",
                            Roles = string.Join(',', new List<RoleEnum> { RoleEnum.Admin }),
                            IpAddress = "127.0.0.1"
                        }
            );

            _dynamoProviderMock!.Setup(r => r.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience,
                    It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);

            // Act
            var result = await _handler!.ExecuteAsync(command);

            // Assert
            _dynamoProviderMock.Verify(r => r.SaveAsync(command.AuthContext.Audience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()), Times.Exactly(3));
            Assert.AreEqual("ABCDE", result[0].InvitationCode);
            Assert.AreEqual("Doe_John Family", result[0].UnitName);
            Assert.AreEqual(2, result[0].Guests!.Count);
            result[0].Guests[0].Preferences.SleepPreference.Should().BeNull();
            result[0].Guests[1].Preferences.SleepPreference.Should().Be(SleepPreferenceEnum.Manor);
        }

        [Test]
        public async Task ExecuteAsync_Should_Save_FamilyUnit_And_Guest_With_GuestId()
        {
            // Arrange
            var guestId = Guid.NewGuid();
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto>()
                {
                    new FamilyUnitDto
                    {
                        InvitationCode = "ABCDE",
                        Tier = "A",
                        Guests = new List<GuestDto>
                        {
                            new GuestDto { FirstName = "Barney", LastName = "Doe", GuestId = guestId.ToString(), Roles = new List<RoleEnum>
                                {
                                    RoleEnum.Guest
                                }},
                        }
                    }},
                    new AuthContext
                    {
                        Audience = _testTokenHelper!.JwtAudience,
                        GuestId = Guid.NewGuid().ToString(),
                        InvitationCode = "CCCCC",
                        Roles = string.Join(',', new List<RoleEnum> { RoleEnum.Admin }),
                        IpAddress = "127.0.0.1"
                    }
            );

            _dynamoProviderMock!.Setup(r => r.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience,
                    It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);

            // Act
            var result = await _handler!.ExecuteAsync(command);

            // Assert
            _dynamoProviderMock.Verify(r => r.SaveAsync(command.AuthContext.Audience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
            Assert.AreEqual("ABCDE", result[0].InvitationCode);
            Assert.AreEqual("Doe_Barney Family", result[0].UnitName);
            Assert.AreEqual(1, result[0].Guests!.Count);
            result![0].Guests![0].GuestId.Should().Be(guestId.ToString());
        }

        [Test]
        public async Task ExecuteAsync_Should_Add_Default_Roles_When_Guest_Roles_Are_Null()
        {
            // Arrange
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto>()
                    {
                     new FamilyUnitDto
                     {
                         InvitationCode = "ABCDE",
                         Tier = "A",
                         Guests = new List<GuestDto>
                        {
                            new GuestDto { FirstName = "John", LastName = "Doe", Roles = null! }
                        }
                     }},
                    new AuthContext
                    {
                        Audience = _testTokenHelper!.JwtAudience,
                        GuestId = Guid.NewGuid().ToString(),
                        InvitationCode = "CCCCC",
                        Roles = string.Join(',', new List<RoleEnum> { RoleEnum.Admin }),
                        IpAddress = "127.0.0.1"
                    }
            );

            _dynamoProviderMock!.Setup(r => r.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience,
                    It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);

            // Act

            var result = await _handler!.ExecuteAsync(command);

            // Assert
            Assert.AreEqual(1, result[0].Guests![0].Roles.Count);
            Assert.AreEqual(RoleEnum.Guest, result![0].Guests![0].Roles[0]);
        }

        [Test]
        public void AddDefaultRoles_Should_Add_None_Role_When_Roles_Are_Null()
        {
            // Arrange
            var guest = new GuestDto { Roles = null! };

            // Act
            _handler!.AddDefaultRolesIfEmpty(guest);

            // Assert
            Assert.AreEqual(1, guest.Roles!.Count);
            Assert.AreEqual(RoleEnum.Guest, guest.Roles[0]);
        }

        [Test]
        public void AddDefaultRoles_Should_Add_None_Role_When_Roles_Are_Empty()
        {
            // Arrange
            var guest = new GuestDto { Roles = new List<RoleEnum>() };

            // Act
            _handler!.AddDefaultRolesIfEmpty(guest);

            // Assert
            Assert.AreEqual(1, guest.Roles.Count);
            Assert.AreEqual(RoleEnum.Guest, guest.Roles[0]);
        }

        [Test]
        public void AddDefaultRoles_Should_Not_Change_Roles_When_Roles_Are_Not_Empty()
        {
            // Arrange
            var guest = new GuestDto { Roles = new List<RoleEnum> { RoleEnum.Admin } };

            // Act
            _handler!.AddDefaultRolesIfEmpty(guest);

            // Assert
            Assert.AreEqual(1, guest.Roles.Count);
            Assert.AreEqual(RoleEnum.Admin, guest.Roles[0]);
        }
    }
}
