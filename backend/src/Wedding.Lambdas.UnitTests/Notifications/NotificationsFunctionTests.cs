using Amazon.Lambda.TestUtilities;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Notify.Email.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Notifications
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.Notify.Email.Function))]
    public class NotificationsFunctionTests
    {

        private Wedding.Lambdas.Notify.Email.Function? Sut;
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestLambdaContext _context;
        private TestTokenHelper? _testTokenHelper;
        private AuthContext? _fakeAuthContext;
        private Mock<IAwsSesHelper>? _mockAwsSesHelper;

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

            var sendEmailNotificationHandler = new SendEmailNotificationHandler(Mock.Of<ILogger<SendEmailNotificationHandler>>(), _mockDynamoDbProvider.Object, _mapper, _mockAwsSesHelper.Object);

            serviceCollection.AddScoped(_ => sendEmailNotificationHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            Sut = new Wedding.Lambdas.Notify.Email.Function(serviceProvider);
        }
    }
}
