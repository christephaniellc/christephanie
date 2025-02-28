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
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Update.Function))]
public class GetFunctionTests
{
    private IMapper? _mapper;
    private TestAuthorizer? _testAuthorizer;
    private TestTokenHelper? _testTokenHelper;
    private Wedding.Lambdas.Admin.FamilyUnit.Update.Function? _function;

    [SetUp]
    public void SetUp()
    {
        var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
            .AddJsonFile("appsettings.Development.json")
            .Build();
        _testTokenHelper = new TestTokenHelper(configuration);
        var serviceCollection = new ServiceCollection();
        var dynamoDBProvider = new Mock<IDynamoDBProvider>();

        var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
            }
        );
        _mapper = config.CreateMapper();

        var familyUnit = new List<WeddingEntity>
        {
            _mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE),
            _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN),
            _mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE),
        };

        dynamoDBProvider.Setup(x => x.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));

        dynamoDBProvider.Setup(x => x.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE_NEW, It.IsAny<CancellationToken>()))
            .ReturnsAsync(null as WeddingEntity);

        dynamoDBProvider.Setup(x => x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));

        dynamoDBProvider.Setup(x => x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JANE.GuestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE));

        dynamoDBProvider
            .Setup(x => x.FromQueryAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
            .ReturnsAsync(familyUnit);

        var adminUpdateFamilyUnitHandler = new AdminUpdateFamilyUnitHandler(Mock.Of<ILogger<AdminUpdateFamilyUnitHandler>>(), dynamoDBProvider.Object, _mapper);

        serviceCollection.AddScoped(_ => adminUpdateFamilyUnitHandler);

        var serviceProvider = serviceCollection.BuildServiceProvider();

        _testAuthorizer = new TestAuthorizer(configuration, serviceCollection);
        _function = new Wedding.Lambdas.Admin.FamilyUnit.Update.Function(serviceProvider);
    }

    [Test]
    public async Task TestAdminUpdateFunction()
    {
        try
        {
            var dto = TestDataHelper.FAMILY_DOE;
            dto.Guests![0].LastName = "Doe-Smith";

            var context = new TestLambdaContext();
            var authContext = await _testAuthorizer!.MockAuthorize(TestDataHelper.GUEST_ADMIN);
            var request = new APIGatewayProxyRequest 
            {
                Body = JsonSerializer.Serialize(dto, JsonSerializationHelper.FromFrontendOptions)
            }.AddAuthToRequest(authContext);

            var response = await _function!.FunctionHandler(request, context);
            var result = response.GetResponseBodyData<FamilyUnitDto>();

            result.Guests.Should().NotBeNull();
            result.Guests!.Count.Should().BeGreaterThan(0);
            result.Guests![0].FirstName.Should().Be("John");
            result.Guests![0].LastName.Should().Be("Doe-Smith");
        }
        catch (Exception ex)
        {
           Assert.Fail(ex.Message);
        }
    }
}
