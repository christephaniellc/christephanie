using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Configuration;
using Wedding.Common.Configuration.Identity;
using Wedding.Common.Dispatchers;
using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Commands;
using Wedding.PublicApi.Controllers;
using Wedding.PublicApi.Logic.Services.Auth;

namespace Wedding.PublicApi.Logic.UnitTests.Controllers
{
    [TestFixture]
    public class AdminFamilyUnitControllerTests
    {
        private Mock<ILogger<AdminFamilyUnitController>> _loggerMock;
        private Mock<IConfiguration> _configurationMock;
        private Mock<IControllerDispatcher> _dispatcherMock;
        private Mock<ILambdaAuthorizer> _lambdaAuthorizerMock;
        private AdminFamilyUnitController _controller;
        private DefaultHttpContext _httpContext;
        private AuthContext _authContext;

        [SetUp]
        public void Setup()
        {
            _loggerMock = new Mock<ILogger<AdminFamilyUnitController>>();
            _configurationMock = new Mock<IConfiguration>();
            _dispatcherMock = new Mock<IControllerDispatcher>();
            _lambdaAuthorizerMock = new Mock<ILambdaAuthorizer>();

            // Setup configuration
            var auth0ConfigSection = new Mock<IConfigurationSection>();
            auth0ConfigSection.Setup(x => x.Value).Returns("test");
            var auth0Config = new Auth0Configuration
            {
                Authority = "https://test.auth0.com",
                Audience = "test-api"
            };
            _configurationMock.Setup(x => x.GetSection(ConfigurationKeys.Auth0)).Returns(auth0ConfigSection.Object);
            auth0ConfigSection.Setup(a => a.Get<Auth0Configuration>()).Returns(auth0Config);

            _controller = new AdminFamilyUnitController(
                _loggerMock.Object,
                _configurationMock.Object,
                _dispatcherMock.Object,
                _lambdaAuthorizerMock.Object
            );

            // Setup HTTP context with headers
            _httpContext = new DefaultHttpContext();
            _httpContext.Request.Headers["Authorization"] = "Bearer test-token";
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = _httpContext
            };

            // Create auth context for testing
            _authContext = new AuthContext
            {
                Audience = "test-api",
                GuestId = "test-guest-id",
                InvitationCode = "TEST123",
                Roles = "Admin",
                Name = "Test Admin",
                IpAddress = "127.0.0.1"
            };

            // Setup Lambda authorizer
            _lambdaAuthorizerMock
                .Setup(x => x.GetAsync(It.IsAny<Wedding.Common.Auth.Commands.ValidateAuthQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(_authContext);
        }

        [Test]
        public async Task GetFamilyUnit_WithValidCode_ReturnsOkResult()
        {
            // Arrange
            var invitationCode = "TEST123";
            var familyUnitDto = new FamilyUnitDto
            {
                InvitationCode = invitationCode,
                UnitName = "Test Family",
                Guests = new List<GuestDto>
                {
                    new GuestDto
                    {
                        FirstName = "Test",
                        LastName = "Guest",
                        Roles = new List<RoleEnum> { RoleEnum.Guest }
                    }
                }
            };

            _dispatcherMock
                .Setup(x => x.GetAsync<AdminGetFamilyUnitQuery, FamilyUnitDto>(
                    It.IsAny<AdminGetFamilyUnitQuery>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(familyUnitDto);

            // Act
            var result = await _controller.GetFamilyUnit(invitationCode);

            // Assert
            Assert.IsInstanceOf<ActionResult<FamilyUnitDto>>(result);
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(StatusCodes.Status200OK, okResult.StatusCode);

            var returnValue = okResult.Value as FamilyUnitDto;
            Assert.IsNotNull(returnValue);
            Assert.AreEqual(invitationCode, returnValue.InvitationCode);
            Assert.AreEqual("Test Family", returnValue.UnitName);
        }

        [Test]
        public async Task GetFamilyUnits_ReturnsOkResultWithList()
        {
            // Arrange
            var familyUnits = new List<FamilyUnitDto>
            {
                new FamilyUnitDto
                {
                    InvitationCode = "TEST001",
                    UnitName = "Family One"
                },
                new FamilyUnitDto
                {
                    InvitationCode = "TEST002",
                    UnitName = "Family Two"
                }
            };

            _dispatcherMock
                .Setup(x => x.GetAsync<AdminGetFamilyUnitsQuery, List<FamilyUnitDto>>(
                    It.IsAny<AdminGetFamilyUnitsQuery>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(familyUnits);

            // Act
            var result = await _controller.GetFamilyUnits();

            // Assert
            Assert.IsInstanceOf<ActionResult<List<FamilyUnitDto>>>(result);
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(StatusCodes.Status200OK, okResult.StatusCode);

            var returnValue = okResult.Value as List<FamilyUnitDto>;
            Assert.IsNotNull(returnValue);
            Assert.AreEqual(2, returnValue.Count);
        }

        [Test]
        public async Task GetAllFamilyUnits_ReturnsOkResultWithList()
        {
            // Arrange
            var familyUnits = new List<FamilyUnitDto>
            {
                new FamilyUnitDto
                {
                    InvitationCode = "TEST001",
                    UnitName = "Family One"
                },
                new FamilyUnitDto
                {
                    InvitationCode = "TEST002",
                    UnitName = "Family Two"
                }
            };

            _dispatcherMock
                .Setup(x => x.GetAsync<AdminGetFamilyUnitsQuery, List<FamilyUnitDto>>(
                    It.IsAny<AdminGetFamilyUnitsQuery>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(familyUnits);

            // Act
            var result = await _controller.GetAllFamilyUnits();

            // Assert
            Assert.IsInstanceOf<ActionResult<List<FamilyUnitDto>>>(result);
            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(StatusCodes.Status200OK, okResult.StatusCode);

            var returnValue = okResult.Value as List<FamilyUnitDto>;
            Assert.IsNotNull(returnValue);
            Assert.AreEqual(2, returnValue.Count);
        }
    }
}