using System.Net;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Delete
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Delete.Function))]
    public class AdminDeleteFunctionTests
    {
        [Test]
        public async Task ShouldDeleteFamily()
        {
            var invitationCode = TestDataHelper.TEST_INVITATION_CODE;
            var config = new MapperConfiguration(cfg =>
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles()));
            var mapper = config.CreateMapper();

            var repository = new Mock<IDynamoDBContext>();
            var mockLambdaContext = new Mock<ILambdaContext>();
            mockLambdaContext.Setup(x => x.Logger).Returns(new Mock<ILambdaLogger>().Object);

            var family = mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE);
            var mockAsyncSearch = new Mock<AsyncSearch<WeddingEntity>>(MockBehavior.Strict);
            mockAsyncSearch.Setup(x => x.GetRemainingAsync(default))
                .ReturnsAsync(new List<WeddingEntity> { family });

            var partitionKey = DynamoKeys.GetFamilyUnitPartitionKey(invitationCode);
            repository.Setup(x => x.QueryAsync<WeddingEntity>(partitionKey, It.IsAny<DynamoDBOperationConfig>()))
                .Returns(mockAsyncSearch.Object);

            var deleteFamilyUnitHandler = new AdminDeleteFamilyUnitHandler(Mock.Of<ILogger<AdminDeleteFamilyUnitHandler>>(), repository.Object, mapper);

            var serviceCollection = new ServiceCollection();
            serviceCollection.AddScoped(_ => deleteFamilyUnitHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            var function = new Wedding.Lambdas.Admin.FamilyUnit.Delete.Function(serviceProvider);
            var request = new APIGatewayProxyRequest
            {
                PathParameters = new Dictionary<string, string>
                {
                    {"invitationCode", invitationCode}
                }
            };

            var result = await function.FunctionHandler(request, mockLambdaContext.Object);

            result.StatusCode.Should().Be((int)HttpStatusCode.OK);
            result.Body.Should().Contain("Successfully deleted family unit");
            result.Body.Should().Contain(invitationCode);
        }
    }
}
