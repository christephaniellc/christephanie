using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Handlers;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Create
{
    [TestFixture]
    [UnitTestsFor(typeof(CreateFamilyUnitHandler))]
    public class CreateFamilyUnitHandlerTests
    {
        private Mock<ILogger<CreateFamilyUnitHandler>> _loggerMock;
        private Mock<IDynamoDBContext> _repositoryMock;
        private CreateFamilyUnitHandler _handler;
        private IMapper _mapper;

        [SetUp]
        public void SetUp()
        {
            var config = new MapperConfiguration(
                cfg => cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles()));
            _mapper = config.CreateMapper();

            _loggerMock = new Mock<ILogger<CreateFamilyUnitHandler>>();
            _repositoryMock = new Mock<IDynamoDBContext>();
            _handler = new CreateFamilyUnitHandler(_loggerMock.Object, _repositoryMock.Object, _mapper);
        }

        [Test]
        public async Task ExecuteAsync_Should_Throw_Exception_When_FamilyUnit_Already_Exists()
        {
            // Arrange
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "A",
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            FirstName = "John",
                            LastName = "Doe"
                        }
                    }
                }
            );

            var existingFamilyUnit = new WeddingEntity
            {
                InvitationCode = $"{DynamoKeys.FamilyUnit}#ABCDE",
                SortKey = DynamoKeys.FamilyInfo
            };

            _repositoryMock.Setup(r => r.LoadAsync<WeddingEntity>(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingFamilyUnit);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ApplicationException>(async () => await _handler.ExecuteAsync(command));
            Assert.That(ex!.Message, Is.EqualTo("An error occurred while saving the family unit."));
        }

        [Test]
        public async Task ExecuteAsync_Should_Save_FamilyUnit_And_Guests()
        {
            // Arrange
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "A",
                    Guests = new List<GuestDto>
                    {
                        new GuestDto { FirstName = "John", LastName = "Doe" },
                        new GuestDto { FirstName = "Jane", LastName = "Doe" }
                    }
                }
            );

            _repositoryMock.Setup(r => r.LoadAsync<WeddingEntity>(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);

            // Act
            var result = await _handler.ExecuteAsync(command);

            // Assert
            _repositoryMock.Verify(r => r.SaveAsync(It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()), Times.Exactly(3));
            Assert.AreEqual("ABCDE", result.InvitationCode);
            Assert.AreEqual("Doe_John Family", result.UnitName);
            Assert.AreEqual(2, result.Guests!.Count);
        }

        [Test]
        public async Task ExecuteAsync_Should_Add_Default_Roles_When_Guest_Roles_Are_Null()
        {
            // Arrange
            var command = new CreateFamilyUnitCommand(
                 new FamilyUnitDto
                 {
                     InvitationCode = "ABCDE",
                     Tier = "A",
                     Guests = new List<GuestDto>
                    {
                        new GuestDto { FirstName = "John", LastName = "Doe", Roles = null! }
                    }
                 }
            );

            _repositoryMock.Setup(r => r.LoadAsync<WeddingEntity>(
                    It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))!
                .ReturnsAsync((WeddingEntity)null!);

            // Act
            var result = await _handler.ExecuteAsync(command);

            // Assert
            Assert.AreEqual(1, result.Guests![0].Roles.Count);
            Assert.AreEqual(RoleEnum.Guest, result.Guests[0].Roles[0]);
        }

        [Test]
        public void AddDefaultRoles_Should_Add_None_Role_When_Roles_Are_Null()
        {
            // Arrange
            var guest = new GuestDto { Roles = null! };

            // Act
            _handler.AddDefaultRoles(guest);

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
            _handler.AddDefaultRoles(guest);

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
            _handler.AddDefaultRoles(guest);

            // Assert
            Assert.AreEqual(1, guest.Roles.Count);
            Assert.AreEqual(RoleEnum.Admin, guest.Roles[0]);
        }
    }
}
