using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Update.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.FamilyUnit.Update.Function))]
    public class UpdateFunctionTests
    {
        private IMapper _mapper;
        private Mock<IDynamoDBProvider> _mockDynamoDbProvider;
        private Wedding.Lambdas.FamilyUnit.Update.Function _function;

        [SetUp]
        public void SetUp()
        {
            var serviceCollection = new ServiceCollection();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();

            var config = new MapperConfiguration(cfg =>
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles()));
            _mapper = config.CreateMapper();

            _mockDynamoDbProvider.Setup(x =>
                    x.LoadFamilyUnitOnlyAsync(TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JANE.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE));

            var updateFamilyUnitHandler = new UpdateFamilyUnitHandler(Mock.Of<ILogger<UpdateFamilyUnitHandler>>(), _mockDynamoDbProvider.Object, _mapper);

            serviceCollection.AddScoped(_ => updateFamilyUnitHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            _function = new Wedding.Lambdas.FamilyUnit.Update.Function(serviceProvider);
        }

        [Test]
        public async Task TestUpdateFunction()
        {
            try
            {
                var dto = TestDataHelper.FAMILY_DOE;
                dto.MailingAddress = "123 Main St.";
                dto.Guests[0].AgeGroup = AgeGroupEnum.Child;
                dto.Guests[0].Rsvp = new RsvpDto
                {
                    InvitationResponse = InvitationResponseEnum.Interested
                };
                dto.Guests[1].Rsvp = new RsvpDto
                {
                    InvitationResponse = InvitationResponseEnum.Declined
                };

                _mockDynamoDbProvider.Setup(x =>
                        x.GetFamilyUnitAsync(TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(dto);

                var context = new TestLambdaContext();

                var fakeAuthContext = new AuthContext
                {
                    GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                    InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                    Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles)
                };

                var request = new APIGatewayProxyRequest
                {
                    RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
                    {
                        Authorizer = new APIGatewayCustomAuthorizerContext
                        {
                            ["lambda"] = JsonSerializer.Serialize(fakeAuthContext)
                        }
                    },
                    Body = JsonSerializer.Serialize(dto, JsonSerializationHelper.FromFrontendOptions)
                };

                var response = await _function.FunctionHandler(request, context);
                var result = response.GetResponseBodyData<FamilyUnitDto>();

                result.Guests.Should().NotBeNull();
                result.Guests!.Count.Should().BeGreaterThan(0);
                result.Guests![0].FirstName.Should().Be("John");
                result.Guests![0].AgeGroup.Should().Be(AgeGroupEnum.Child);
                result.Guests![0].Rsvp.InvitationResponse.Should().Be(InvitationResponseEnum.Interested);
                result.Guests![1].Rsvp.InvitationResponse.Should().Be(InvitationResponseEnum.Declined);
                result.MailingAddress.Should().Be("123 Main St.");
                result.CalculateHeadcount().Should().Be(1);
            }
            catch (Exception ex)
            {
                Assert.Fail(ex.Message);
            }
        }
    }
}
