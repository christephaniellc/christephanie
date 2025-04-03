using System.Net;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Mapping;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Stats.Get.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Stats.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Get.Function))]
    public class GetStatsFunctionTests
    {
        private Wedding.Lambdas.Stats.Get.Function? Sut;
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestLambdaContext _context;
        private TestTokenHelper? _testTokenHelper;
        private AuthContext? _fakeAuthContext;

        [SetUp]
        public void Setup()
        {
            var serviceCollection = new ServiceCollection();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();

            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _context = new TestLambdaContext();

            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles),
                Name = TestDataHelper.GUEST_JOHN.FirstName + " " + TestDataHelper.GUEST_JOHN.LastName,
                IpAddress = "127.0.0.1"
            };
            
            _mapper = MappingProfileHelper.GetMapper();

            var families = new List<FamilyUnitDto>
            {
                TestDataHelper.FAMILY_DOE
            };

            _mockDynamoDbProvider.Setup(x =>
                    x.GetFamilyUnitsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(families);

            var patchGuestHandler = new GetStatsHandler(Mock.Of<ILogger<GetStatsHandler>>(), _mockDynamoDbProvider.Object, _mapper);

            serviceCollection.AddScoped(_ => patchGuestHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            Sut = new Wedding.Lambdas.Stats.Get.Function(serviceProvider);
        }

        [Test]
        public async Task Function_GetStats_Unauthed_ReturnsBadResponse()
        {
            // Arrange
            var request = new APIGatewayProxyRequest
            {
                Headers = new Dictionary<string, string>
                {
                    { "Authorization", "Bearer dummy-token" }
                }
            };

            // Act
            var response = await Sut.FunctionHandler(request, _context);
            var error = response.GetResponseBodyError();

            // Assert
            response.Should().NotBeNull();
            response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
            error.Error.Should().Be("FluentValidation.ValidationException");
            
            Assert.IsNotNull(response.Body);
        }

        [Test]
        public async Task Function_GetAllFamilyUnits_ReturnsCorrectResponse()
        {
            // Arrange
            var request = TestRequestHelper.RequestAsJohn();

            // Act
            var response = await Sut.FunctionHandler(request, _context);

            // Assert
            Assert.IsNotNull(response);
            Assert.AreEqual(200, response.StatusCode);
            
            Assert.IsNotNull(response.Body);

            var result = response.GetResponseBodyData<List<FamilyUnitViewModel>>();
            var familyUnit = result.First();

            result.Count.Should().Be(1);
            familyUnit.InvitationCode.Should().Be(TestDataHelper.FAMILY_DOE.InvitationCode);
        }
    }
}