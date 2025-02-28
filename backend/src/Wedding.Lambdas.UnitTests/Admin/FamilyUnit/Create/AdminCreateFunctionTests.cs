using System.Net;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Helpers.AWS.Frontend;
using Wedding.Common.Serialization;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Create;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Create.Function))]
public class AdminCreateFunctionTests
{
    private Mock<ILogger<AdminCreateFamilyUnitHandler>>? _handlerLogger;
    private Mock<ILambdaContext>? _mockLambdaContext;
    private Mock<IDynamoDBProvider>? _dynamoDBProvider;
    private TestAuthorizer? _testAuthorizer;
    private Lambdas.Admin.FamilyUnit.Create.Function? _function;

    [SetUp]
    public void Setup()
    {
        var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
            .AddJsonFile("appsettings.Development.json")
            .Build();
        var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
            }
        );
        var mapper = config.CreateMapper();

        _handlerLogger = new Mock<ILogger<AdminCreateFamilyUnitHandler>>();
        _mockLambdaContext = new Mock<ILambdaContext>();
        _mockLambdaContext.Setup(x => x.Logger).Returns(new Mock<ILambdaLogger>().Object);
        _dynamoDBProvider = new Mock<IDynamoDBProvider>();

        var deleteFamilyUnitHandler = new AdminCreateFamilyUnitHandler(_handlerLogger.Object, _dynamoDBProvider.Object, mapper);

        var serviceCollection = new ServiceCollection();
        serviceCollection.AddScoped(_ => deleteFamilyUnitHandler);
        var serviceProvider = serviceCollection.BuildServiceProvider();

        _testAuthorizer = new TestAuthorizer(configuration, serviceCollection);
        _function = new Lambdas.Admin.FamilyUnit.Create.Function(serviceProvider);
    }

    [Test]
    public async Task ShouldNotCreateFamilyUnitHandlerWithoutAdmin()
    {
        var authContext = await _testAuthorizer!.MockAuthorize(TestDataHelper.GUEST_JOHN);
        var familyUnit = new FamilyUnitDto
        {
            InvitationCode = "ABCDE",
            Tier = "A",
            Guests = new List<GuestDto>
            {
                new GuestDto
                {
                    FirstName = TestDataHelper.GUEST_JOHN.FirstName,
                    LastName = TestDataHelper.GUEST_JOHN.LastName,
                    GuestNumber = 1,
                    Roles = new List<RoleEnum> { RoleEnum.Guest }
                }
            }
        };
        var request = new APIGatewayProxyRequest
        {
            Body = JsonSerializer.Serialize(new List<FamilyUnitDto> { familyUnit }, JsonSerializationHelper.FromFrontendOptions)
        }.AddAuthToRequest(authContext);

        var response = await _function!.FunctionHandler(request, _mockLambdaContext!.Object);
        var errorResult = JsonSerializer.Deserialize<FrontendApiError>(response.Body);

        // Assert
        response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        errorResult!.Status.Should().Be((int)HttpStatusCode.BadRequest);
        errorResult.Error.Should().Be("FluentValidation.ValidationException");
        errorResult.Description.Should().Contain("AuthContext: No admin permissions.");
    }

    [Test]
    public async Task ShouldCreateFamilyUnitHandler()
    {
        var authContext = await _testAuthorizer!.MockAuthorize(TestDataHelper.GUEST_ADMIN);
        var familyUnit = new FamilyUnitDto
        {
            InvitationCode = "ABCDE",
            Tier = "A",
            Guests = new List<GuestDto>
            {
                new GuestDto
                {
                    FirstName = TestDataHelper.GUEST_JOHN.FirstName,
                    LastName = TestDataHelper.GUEST_JOHN.LastName,
                    GuestNumber = 1,
                    Roles = TestDataHelper.GUEST_JOHN.Roles
                }
            }
        };
        var request = new APIGatewayProxyRequest {
            Body = JsonSerializer.Serialize(new List<FamilyUnitDto> {familyUnit}, JsonSerializationHelper.FromFrontendOptions)
        }.AddAuthToRequest(authContext);
        
        var response = await _function!.FunctionHandler(request, _mockLambdaContext!.Object);
        var result = response.GetResponseBodyData<List<FamilyUnitDto>>();

        result[0].Guests.Should().NotBeNull();
        result[0].Guests!.Count.Should().BeGreaterThan(0);
        result[0].Guests![0].FirstName.Should().Be("John");
    }
}
