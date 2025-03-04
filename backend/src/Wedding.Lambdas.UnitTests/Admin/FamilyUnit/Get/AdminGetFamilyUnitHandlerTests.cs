using AutoMapper;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Handlers;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminGetFamilyUnitHandler))]
    public class AdminGetFamilyUnitHandlerTests
    {
        private AdminGetFamilyUnitHandler _handler;
        private Mock<ILogger<AdminGetFamilyUnitHandler>> _loggerMock;
        private Mock<IDynamoDBProvider> _dynamoDbProviderMock;
        private Mock<IMapper> _mapperMock;
        private AuthContext _authContext;

        [SetUp]
        public void SetUp()
        {
            _loggerMock = new Mock<ILogger<AdminGetFamilyUnitHandler>>();
            _dynamoDbProviderMock = new Mock<IDynamoDBProvider>();
            _mapperMock = new Mock<IMapper>();
            
            _handler = new AdminGetFamilyUnitHandler(
                _loggerMock.Object,
                _dynamoDbProviderMock.Object,
                _mapperMock.Object);
                
            _authContext = new AuthContext
            {
                Audience = "test-audience",
                GuestId = Guid.Parse("11111111-1111-1111-1111-111111111111").ToString(),
                InvitationCode = "TEST123",
                Roles = "Admin",
                Name = "Test Admin",
                IpAddress = "127.0.0.1"
            };
        }

        [Test]
        public async Task GetAsync_WithSingleInvitationCode_ReturnsFamilyUnit()
        {
            // Arrange
            var invitationCode = "TEST123";
            var query = new AdminGetFamilyUnitQuery(invitationCode, _authContext);
            
            var familyUnitDto = new FamilyUnitDto 
            { 
                InvitationCode = invitationCode,
                UnitName = "Test Family",
                Guests = new List<GuestDto>
                {
                    new GuestDto 
                    { 
                        GuestId = Guid.NewGuid().ToString(),
                        FirstName = "Test",
                        LastName = "User"
                    }
                }
            };
            
            _dynamoDbProviderMock
                .Setup(x => x.GetFamilyUnitAsync(
                    _authContext.Audience, 
                    invitationCode, 
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(familyUnitDto);
                
            _mapperMock
                .Setup(x => x.Map<FamilyUnitDto>(It.IsAny<WeddingEntity>()))
                .Returns(familyUnitDto);
            
            // Act
            var result = await _handler.GetAsync(query);
            
            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(invitationCode, result.InvitationCode);
            Assert.AreEqual("Test Family", result.UnitName);
            Assert.IsNotNull(result.Guests);
            Assert.AreEqual(1, result.Guests.Count);
        }
        
        [Test]
        public async Task GetAsync_WhenGetAllFamilyUnits_ReturnsAllFamilies()
        {
            // Arrange
            var query = new AdminGetFamilyUnitsQuery(_authContext);
            
            var familyUnits = new List<FamilyUnitDto>
            {
                new FamilyUnitDto
                {
                    InvitationCode = "TEST001",
                    UnitName = "Family One",
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            GuestId = Guid.NewGuid().ToString(),
                            FirstName = "Guest",
                            LastName = "One"
                        }
                    }
                },
                new FamilyUnitDto
                {
                    InvitationCode = "TEST002",
                    UnitName = "Family Two",
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            GuestId = Guid.NewGuid().ToString(),
                            FirstName = "Guest",
                            LastName = "Two"
                        }
                    }
                }
            };
            
            _dynamoDbProviderMock
                .Setup(x => x.GetFamilyUnitsAsync(
                    _authContext.Audience,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(familyUnits);
                
            _mapperMock
                .Setup(x => x.Map<List<FamilyUnitDto>>(It.IsAny<List<WeddingEntity>>()))
                .Returns(familyUnits);
            
            // Act
            var result = await _handler.GetAsync(query);
            
            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual("TEST001", result[0].InvitationCode);
            Assert.AreEqual("TEST002", result[1].InvitationCode);
        }
        
        [Test]
        public void GetAsync_SingleFamily_ThrowsExceptionWhenNotFound()
        {
            // Arrange
            var invitationCode = "NONEXISTENT";
            var query = new AdminGetFamilyUnitQuery(invitationCode, _authContext);
            
            _dynamoDbProviderMock
                .Setup(x => x.GetFamilyUnitAsync(
                    _authContext.Audience, 
                    invitationCode, 
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync((FamilyUnitDto)null);
            
            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _handler.GetAsync(query));
            
            Assert.That(ex.Message, Does.Contain("User not found"));
        }
        
        [Test]
        public void GetAsync_AllFamilies_ThrowsExceptionWhenNotFound()
        {
            // Arrange
            var query = new AdminGetFamilyUnitsQuery(_authContext);
            
            _dynamoDbProviderMock
                .Setup(x => x.GetFamilyUnitsAsync(
                    _authContext.Audience,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync((List<FamilyUnitDto>)null);
            
            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _handler.GetAsync(query));
            
            Assert.That(ex.Message, Does.Contain("User not found"));
        }
    }
}
