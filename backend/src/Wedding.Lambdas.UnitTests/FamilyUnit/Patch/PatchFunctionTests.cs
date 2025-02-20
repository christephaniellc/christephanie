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
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Patch.Handlers;
using Wedding.Lambdas.FamilyUnit.Patch.Requests;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Patch
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.FamilyUnit.Patch.Function))]
    public class PatchFunctionTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;
        private Wedding.Lambdas.FamilyUnit.Patch.Function? Sut;

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

            var patchFamilyUnitHandler = new PatchFamilyUnitHandler(Mock.Of<ILogger<PatchFamilyUnitHandler>>(), _mockDynamoDbProvider.Object, _mapper);
            //var updateFamilyUnitHandler = new UpdateFamilyUnitHandler(Mock.Of<ILogger<UpdateFamilyUnitHandler>>(), _mockDynamoDbProvider.Object, _mapper);

            serviceCollection.AddScoped(_ => patchFamilyUnitHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            Sut = new Wedding.Lambdas.FamilyUnit.Patch.Function(serviceProvider);
        }

        [Test]
        public async Task TestPatchFunction_AllProperties()
        {
            try
            {
                // ARRANGE
                var mutableDto = TestDataHelper.FAMILY_DOE;
                var patchRequest = new PatchFamilyUnitRequest
                {
                    MailingAddress = new AddressDto { StreetAddress = "798 Sesame St." },
                    InvitationResponseNotes = "This is a test"
                };
                
                _mockDynamoDbProvider!
                    .Setup(x => x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(mutableDto);

                _mockDynamoDbProvider!
                    .Setup(x => x.SaveAsync(_testTokenHelper!.JwtAudience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                    .Callback<string, WeddingEntity, CancellationToken>((aud, updatedEntity, ct) =>
                    {
                        mutableDto.MailingAddress = _mapper!.Map<AddressDto>(updatedEntity.MailingAddress);
                        mutableDto.InvitationResponseNotes = updatedEntity.InvitationResponseNotes;
                    })
                    .Returns(Task.CompletedTask);

                _mockDynamoDbProvider!
                    .Setup(x => x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(() => mutableDto);

                var context = new TestLambdaContext();
                var request = TestRequestHelper.RequestAsJohn(patchRequest);

                // ACT
                var response = await Sut!.FunctionHandler(request, context);
                var result = response.GetResponseBodyData<FamilyUnitViewModel>();

                // ASSERT
                result.Should().NotBeNull();
                result!.MailingAddress!.StreetAddress.Should().Be("798 Sesame St.");
                result!.InvitationResponseNotes.Should().Be("This is a test");
            }
            catch (Exception ex)
            {
                Assert.Fail(ex.Message);
            }
        }

        [Test]
        public async Task TestPatchFunction_JustNotes()
        {
            try
            {
                // ARRANGE
                var mutableDto = TestDataHelper.FAMILY_DOE;
                var patchRequest = new PatchFamilyUnitRequest
                {
                    InvitationResponseNotes = "This is a test"
                };

                _mockDynamoDbProvider!
                    .Setup(x => x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(mutableDto);

                _mockDynamoDbProvider!
                    .Setup(x => x.SaveAsync(_testTokenHelper!.JwtAudience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                    .Callback<string, WeddingEntity, CancellationToken>((aud, updatedEntity, ct) =>
                    {
                        mutableDto.MailingAddress = _mapper!.Map<AddressDto>(updatedEntity.MailingAddress);
                        mutableDto.InvitationResponseNotes = updatedEntity.InvitationResponseNotes;
                    })
                    .Returns(Task.CompletedTask);

                _mockDynamoDbProvider!
                    .Setup(x => x.GetFamilyUnitAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(() => mutableDto);

                var context = new TestLambdaContext();
                var request = TestRequestHelper.RequestAsJohn(patchRequest);

                // ACT
                var response = await Sut!.FunctionHandler(request, context);
                var result = response.GetResponseBodyData<FamilyUnitViewModel>();

                // ASSERT
                result.Should().NotBeNull();
                result!.MailingAddress!.StreetAddress.Should().Be(TestDataHelper.FAMILY_DOE.MailingAddress!.StreetAddress);
                result!.InvitationResponseNotes.Should().Be("This is a test");
            }
            catch (Exception ex)
            {
                Assert.Fail(ex.Message);
            }
        }
    }
}
