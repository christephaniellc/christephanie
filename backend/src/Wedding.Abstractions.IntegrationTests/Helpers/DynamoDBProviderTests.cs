using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Wedding.Abstractions.Entities;
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
            
            _mapper = MappingProfileHelper.GetMapper();
            _multitenancySettingsProviderMock = new Mock<IMultitenancySettingsProvider>();

            // Configure the multitenancy settings provider to return a dummy table name.
            _multitenancySettingsProviderMock.Setup(x => x.GetMappedTableName(Audience, DatabaseTableEnum.GuestData))
                .Returns(_testTableName);
            _multitenancySettingsProviderMock.Setup(x => x.GetMappedTableName(Audience, DatabaseTableEnum.RateLimiting))
                .Returns(_testTableNameRateLimit);
            _multitenancySettingsProviderMock.Setup(x => x.GetMappedTableName(Audience, DatabaseTableEnum.PaymentData))
                .Returns(_testTableName);

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

        [Test]
        public async Task GetPaymentByIdAsync_ShouldReturnEntity_WhenExists()
        {
            var paymentId = "pi_test_123";
            var timestamp = "2025-04-01T10:00:00Z";
            var partitionKey = $"PAYMENT#{paymentId}";
            var sortKey = $"METADATA#{timestamp}";
            var entity = CreateTestPaymentEntity(timestamp: timestamp);

            var mockContext = new Mock<IDynamoDBContext>();
            mockContext.Setup(x => x.LoadAsync<PaymentIntentEntity>(partitionKey, sortKey,
                It.IsAny<DynamoDBOperationConfig>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(entity);

            var provider = new DynamoDBProvider(_loggerMock.Object, mockContext.Object, _mapper, _multitenancySettingsProviderMock.Object);

            var result = await provider.GetPaymentByIdAsync(Audience, paymentId);

            Assert.IsNotNull(result);
            Assert.AreEqual(paymentId, result.PaymentIntentId);
            Assert.AreEqual(partitionKey, result.PartitionKey);
        }

        [Test]
        public async Task GetPaymentsByGuestIdAsync_ShouldReturnEntities()
        {
            var guestId = "guest123";
            var entity = CreateTestPaymentEntity(guestId: guestId);

            var mockAsyncSearch = new Mock<AsyncSearch<PaymentIntentEntity>>();
            mockAsyncSearch.Setup(x => x.GetRemainingAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<PaymentIntentEntity> { entity });

            var mockContext = new Mock<IDynamoDBContext>();
            mockContext.Setup(x => x.QueryAsync<PaymentIntentEntity>($"GUEST#{guestId}",
                    It.Is<DynamoDBOperationConfig>(cfg => cfg.IndexName == "AllByGuestIndex")))
                .Returns(mockAsyncSearch.Object);

            var provider = new DynamoDBProvider(_loggerMock.Object, mockContext.Object, _mapper, _multitenancySettingsProviderMock.Object);

            var results = await provider.GetPaymentsByGuestIdAsync(Audience, guestId);

            Assert.That(results, Is.Not.Null);
            Assert.That(results.Count, Is.EqualTo(1));
            Assert.That(results.First().GuestId, Is.EqualTo(guestId));
        }

        [Test]
        public async Task GetPaymentsByCategoryAsync_ShouldReturnEntities()
        {
            var category = "Registry";
            var entity = CreateTestPaymentEntity(category: category);

            var mockAsyncSearch = new Mock<AsyncSearch<PaymentIntentEntity>>();
            mockAsyncSearch.Setup(x => x.GetRemainingAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<PaymentIntentEntity> { entity });

            var mockContext = new Mock<IDynamoDBContext>();
            mockContext.Setup(x => x.QueryAsync<PaymentIntentEntity>($"CATEGORY#{category}",
                    It.Is<DynamoDBOperationConfig>(cfg => cfg.IndexName == "AllByCategoryIndex")))
                .Returns(mockAsyncSearch.Object);

            var provider = new DynamoDBProvider(_loggerMock.Object, mockContext.Object, _mapper, _multitenancySettingsProviderMock.Object);

            var results = await provider.GetPaymentsByCategoryAsync(Audience, category);

            Assert.That(results, Is.Not.Null);
            Assert.That(results.Count, Is.EqualTo(1));
            Assert.That(results.First().GiftCategory, Is.EqualTo(category));
        }


        private PaymentIntentEntity CreateTestPaymentEntity(string guestId = "guest123", string category = "Registry", string timestamp = "2025-04-01T10:00:00Z")
        {
            return new PaymentIntentEntity
            {
                PaymentIntentId = "pi_test_123",
                InvitationCode = "ABCDE",
                GuestId = guestId,
                GuestName = "Test Guest",
                Amount = 5000,
                Currency = "usd",
                GiftCategory = category,
                GiftNotes = "Enjoy!",
                IsAnonymous = false,
                Timestamp = timestamp,
                PartitionKey = $"PAYMENT#pi_test_123",
                SortKey = $"METADATA#{timestamp}",
                GuestIdGSI = $"GUEST#{guestId}",
                GuestSortKey = timestamp,
                GiftCategoryGSI = $"CATEGORY#{category}",
                CategorySortKey = timestamp
            };
        }
    }
}
