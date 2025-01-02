using System.Text.Json;
using System.Threading;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using Amazon.SimpleSystemsManagement.Model;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NSubstitute;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Update.Function))]
public class GetFunctionTests
{
    private IMapper _mapper;
    private Wedding.Lambdas.Admin.FamilyUnit.Update.Function _function;

    [SetUp]
    public void SetUp()
    {
        var serviceCollection = new ServiceCollection();
        var repository = new Mock<IDynamoDBContext>();

        var config = new MapperConfiguration(cfg =>
            cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles()));
        _mapper = config.CreateMapper();

        // var mockAsyncSearch = new Mock<AsyncSearch<WeddingEntity>>(MockBehavior.Strict);
        // mockAsyncSearch.Setup(x => x.GetRemainingAsync(default))
        //     .ReturnsAsync(familySearchResult);
        // repository.Setup(x => x.FromQueryAsync<WeddingEntity>(It.IsAny<QueryOperationConfig>(), It.IsAny<DynamoDBOperationConfig>()))
        // .Returns(mockAsyncSearch.Object);

        //var mockAsyncSearch = new Mock<AsyncSearch<WeddingEntity>>(MockBehavior.Strict);
        // repository.Setup(x =>
        //         x.LoadAsync<WeddingEntity>(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
        //     .ReturnsAsync(null);

        var partitionKey = DynamoKeys.GetPartitionKey(TestDataHelper.TEST_INVITATION_CODE);
        var sortKey = DynamoKeys.GetFamilyInfoSortKey();
        repository.Setup(x => x.LoadAsync<WeddingEntity>(partitionKey, sortKey, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));

        var partitionKeyNoResults = DynamoKeys.GetPartitionKey(TestDataHelper.TEST_INVITATION_CODE_NEW);
        repository.Setup(x => x.LoadAsync<WeddingEntity>(partitionKeyNoResults, sortKey, It.IsAny<CancellationToken>()))
        .ReturnsAsync(null as WeddingEntity);
        
        var guestSortKeyJohn = DynamoKeys.GetGuestSortKey(TestDataHelper.GUEST_JOHN.GuestId);
        repository.Setup(x => x.LoadAsync<WeddingEntity>(partitionKey, guestSortKeyJohn, It.IsAny<CancellationToken>()))
            .ReturnsAsync(null as WeddingEntity);

        var guestSortKeyJane = DynamoKeys.GetGuestSortKey(TestDataHelper.GUEST_JANE.GuestId);
        repository.Setup(x => x.LoadAsync<WeddingEntity>(partitionKey, guestSortKeyJane, It.IsAny<CancellationToken>()))
            .ReturnsAsync(null as WeddingEntity);

        var adminUpdateFamilyUnitHandler = new AdminUpdateFamilyUnitHandler(Mock.Of<ILogger<AdminUpdateFamilyUnitHandler>>(), repository.Object, _mapper);

        serviceCollection.AddScoped(_ => adminUpdateFamilyUnitHandler);

        var serviceProvider = serviceCollection.BuildServiceProvider();

        _function = new Wedding.Lambdas.Admin.FamilyUnit.Update.Function(serviceProvider);
        //_deleteFunction = new Wedding.Lambdas.Admin.FamilyUnit.Delete.Function();
    }

    // [TearDown]
    // public async Task TearDown()
    // {
    //     var context = new TestLambdaContext();
    //     var command = new AdminDeleteFamilyUnitCommand(TestDataHelper.REAL_JSON_FAMILY_UNIT);
    //     var request = new APIGatewayProxyRequest
    //     {
    //         Body = JsonSerializer.Serialize(command, JsonSerializationHelper.FromFrontendOptions)
    //     };
    //     var response = await _deleteFunction.FunctionHandler(request, context);
    //     var result = response.GetResponseBody<string>();
    // }

    [Test]
    public async Task TestUpdateFunction()
    {
        try
        {
            var dto = JsonSerializer.Deserialize<FamilyUnitDto>(TestDataHelper.REAL_JSON_FAMILY_UNIT, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        // var testDto =
        //     new FamilyUnitDto
        //     {
        //         InvitationCode = "ABCDE",
        //         Tier = "A",
        //         Guests = new List<GuestDto>
        //         {
        //             new GuestDto
        //             {
        //                 FirstName = "John",
        //                 LastName = "Doe"
        //             }
        //         }
        //     };

        var context = new TestLambdaContext();
        var command = new AdminUpdateFamilyUnitCommand(dto, dto.Guests[0].Roles);
        var request = new APIGatewayProxyRequest {
            Body = JsonSerializer.Serialize(command, JsonSerializationHelper.FromFrontendOptions)
        };

        var response = await _function.FunctionHandler(request, context);
        var result = response.GetResponseBodyData<FamilyUnitDto>();

        result.Guests.Should().NotBeNull();
        result.Guests!.Count.Should().BeGreaterThan(0);
        result.Guests![0].FirstName.Should().Be("John");
        }
        catch (Exception ex)
        {
           Assert.Fail(ex.Message);
        }
    }
}
