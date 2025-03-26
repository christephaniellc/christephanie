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
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Update.Handlers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.FamilyUnit.Update.Function))]
    public class UpdateFunctionTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;
        private Wedding.Lambdas.FamilyUnit.Update.Function? Sut;

        [SetUp]
        public void SetUp()
        {
            var serviceCollection = new ServiceCollection();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();

            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);

            var config = new MapperConfiguration(cfg =>
                {
                    cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                    cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                    cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
                    cfg.AddProfiles(DesignConfigurationEntityToDtoMapping.Profiles());
                }
            );
            
            _mapper = config.CreateMapper();

            _mockDynamoDbProvider.Setup(x =>
                    x.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, TestDataHelper.GUEST_JANE.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE));

            var updateFamilyUnitHandler = new UpdateFamilyUnitHandler(Mock.Of<ILogger<UpdateFamilyUnitHandler>>(), _mockDynamoDbProvider.Object, _mapper);

            serviceCollection.AddScoped(_ => updateFamilyUnitHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            Sut = new Wedding.Lambdas.FamilyUnit.Update.Function(serviceProvider);
        }

        [Test]
        public async Task TestUpdateFunction()
        {
            try
            {
                // ARRANGE
                var dto = TestDataHelper.FAMILY_DOE;
                var updatedPhone = "777-777-7777";
                dto.MailingAddress = new AddressDto { StreetAddress = "123 Main St." };
                dto.Guests![0].AgeGroup = AgeGroupEnum.Under13;
                dto.Guests[0].Rsvp = new RsvpDto
                {
                    InvitationResponse = InvitationResponseEnum.Interested
                };
                dto.Guests[1].Rsvp = new RsvpDto
                {
                    InvitationResponse = InvitationResponseEnum.Declined
                };
                dto.Guests[0].Phone = new VerifiedDto
                {
                    Value = updatedPhone,
                    Verified = false
                };

                _mockDynamoDbProvider!.Setup(x =>
                        x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(dto);
         
                var context = new TestLambdaContext();
                var request = TestRequestHelper.RequestAsJohn(dto);

                // ACT
                var response = await Sut!.FunctionHandler(request, context);
                var result = response.GetResponseBodyData<FamilyUnitViewModel>();

                // ASSERT
                result.Should().NotBeNull();
                result.Guests.Should().NotBeNull();
                result.Guests!.Count.Should().BeGreaterThan(0);
                result.Guests![0].FirstName.Should().Be("John");
                result.Guests![0].AgeGroup.Should().Be(AgeGroupEnum.Under13);
                result!.Guests![0]!.Phone!.MaskedValue.Should().Be(ObfuscationHelper.MaskPhone(updatedPhone));
                result!.Guests![0]!.Rsvp!.InvitationResponse.Should().Be(InvitationResponseEnum.Interested);
                result!.Guests![1]!.Rsvp!.InvitationResponse.Should().Be(InvitationResponseEnum.Declined);
                result!.MailingAddress!.StreetAddress.Should().Be("123 Main St.");

                var updatedDto = _mapper.Map<FamilyUnitDto>(result);
                updatedDto.CalculateHeadcount().Should().Be(1);
            }
            catch (Exception ex)
            {
                Assert.Fail(ex.Message);
            }
        }
    }
}
