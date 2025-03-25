using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NSubstitute;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Multitenancy;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.IntegrationTests.Helpers
{
    [UnitTestsFor(typeof(DynamoDBProvider))]
    [TestFixture]
    public class DynamoDBProviderTests
    {
        private IDynamoDBProvider Sut;
        private Mock<ILogger<DynamoDBProvider>> _loggerMock;
        private IDynamoDBContext _dynamoDbContext;
        private IMapper _mapper;
        private Mock<IMultitenancySettingsProvider> _multitenancySettingsProviderMock;
        private string _testTableName = "christephanie-wedding-unittests";
        private string _testTableNameRateLimit = "christephanie-wedding-unittests-rate-limit";
        private const string Audience = "unittests";

        [SetUp]
        public void SetUp()
        {
            _loggerMock = new Mock<ILogger<DynamoDBProvider>>();
            var config = new MapperConfiguration(cfg =>
                {
                    cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                    cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                    cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
                    cfg.AddProfiles(DesignConfigurationEntityToDtoMapping.Profiles());
                }
            );
            _mapper = config.CreateMapper();
            _multitenancySettingsProviderMock = new Mock<IMultitenancySettingsProvider>();

            // Configure the multitenancy settings provider to return a dummy table name.
            _multitenancySettingsProviderMock.Setup(x => x.GetMappedTableName(Audience, DatabaseTableEnum.GuestData))
                .Returns(_testTableName);
            _multitenancySettingsProviderMock.Setup(x => x.GetMappedTableName(Audience, DatabaseTableEnum.RateLimiting))
                .Returns(_testTableNameRateLimit);

            var serviceCollection = new ServiceCollection();
            var dynamoDbClient = new AmazonDynamoDBClient();
            serviceCollection.AddSingleton<IAmazonDynamoDB>(dynamoDbClient);
            serviceCollection.AddScoped<IDynamoDBContext, DynamoDBContext>();
            var serviceProvider = serviceCollection.BuildServiceProvider();
            _dynamoDbContext = serviceProvider.GetRequiredService<IDynamoDBContext>();

            Sut = new DynamoDBProvider(_loggerMock.Object, _dynamoDbContext, _mapper, _multitenancySettingsProviderMock.Object);
        }

        [TearDown]
        public void TearDown()
        {
            _dynamoDbContext.Dispose();
        }

        [Test]
        public async Task CheckRateLimit_ShouldLimitRequests_AfterThreshold()
        {
            var ipAddress = "192.168.1.100";
            var route = "/validate/phone";

            var rateLimit = 3;
            var rateLimitPerSeconds = 5;

            // First request (allowed)
            var isRateLimited1 = await Sut.CheckRateLimitAsync(Audience, ipAddress, route, rateLimit, rateLimitPerSeconds);
            Assert.False(isRateLimited1, "First request should be allowed.");

            // Second request (allowed)
            var isRateLimited2 = await Sut.CheckRateLimitAsync(Audience, ipAddress, route, rateLimit, rateLimitPerSeconds);
            Assert.False(isRateLimited2, "Second request should be allowed.");

            // Third request (allowed)
            var isRateLimited3 = await Sut.CheckRateLimitAsync(Audience, ipAddress, route, rateLimit, rateLimitPerSeconds);
            Assert.False(isRateLimited3, "Third request should be allowed.");

            // Fourth request (within 1 second, should be rate limited)
            var isRateLimited4 = await Sut.CheckRateLimitAsync(Audience, ipAddress, route, rateLimit, rateLimitPerSeconds);
            Assert.True(isRateLimited4, "Fourth request within 1 second should be blocked.");

            await Task.Delay(rateLimitPerSeconds*1000); // Wait until rate limit expires

            // Fifth request (after waiting, should be allowed again)
            var isRateLimited5 = await Sut.CheckRateLimitAsync(Audience, ipAddress, route, rateLimit, rateLimitPerSeconds);
            Assert.False(isRateLimited5, "Fifth request after delay should be allowed.");
        }
    }
}
