using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Stats.Get.Commands;
using Wedding.Lambdas.Stats.Get.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Stats.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetStatsHandler))]
    public class GetStatsHandlerTests
    {
        private GetStatsHandler _handler;
        private Mock<ILogger<GetStatsHandler>> _loggerMock;
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
            _loggerMock = new Mock<ILogger<GetStatsHandler>>();
            _dynamoDbProviderMock = new Mock<IDynamoDBProvider>();

            var config = new MapperConfiguration(cfg =>
                {
                    cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                    cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                    cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
                    cfg.AddProfiles(DesignConfigurationEntityToDtoMapping.Profiles());
                }
            );

            _mapper = config.CreateMapper();

            _handler = new GetStatsHandler(
                _loggerMock.Object,
                _dynamoDbProviderMock.Object,
                _mapper);
            
            var families = new List<FamilyUnitDto>
            {
                TestDataHelper.FAMILY_DOE
            };

            _dynamoDbProviderMock.Setup(x =>
                    x.GetFamilyUnitsAsync(It.IsAny<string>(),  It.IsAny<CancellationToken>()))
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
        public async Task GetAsync_WhenGetStats_ReturnsAllFamilies()
        {
            // Arrange
            var query = new GetStatsQuery(_fakeAuthContext);
            
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
                            LastName = "One",
                            Roles = new List<RoleEnum> { RoleEnum.Guest }
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
                            LastName = "Two",
                            Roles = new List<RoleEnum> { RoleEnum.Guest }
                        }
                    }
                }
            };
            
            _dynamoDbProviderMock
                .Setup(x => x.GetFamilyUnitsAsync(
                    _fakeAuthContext.Audience,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(familyUnits);

            // Act
            var result = await _handler.GetAsync(query);
            
            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual("TEST001", result[0].InvitationCode);
            Assert.AreEqual("TEST002", result[1].InvitationCode);
        }
        
        [Test]
        public void GetAsync_Stats_ThrowsExceptionWhenNotFound()
        {
            // Arrange
            var query = new GetStatsQuery(_fakeAuthContext);
            
            _dynamoDbProviderMock
                .Setup(x => x.GetFamilyUnitsAsync(
                    _fakeAuthContext.Audience,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync((List<FamilyUnitDto>)null);
            
            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _handler.GetAsync(query));
            
            Assert.That(ex.Message, Does.Contain("User not found"));
        }
    }
}
