using System.Net;
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
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Guest.Patch.Handlers;
using Wedding.Lambdas.Guest.Patch.Requests;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Guest.Patch
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.Guest.Patch.Function))]
    public class PatchFunctionTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;
        private Wedding.Lambdas.Guest.Patch.Function? Sut;

        [SetUp]
        public void SetUp()
        {
            var serviceCollection = new ServiceCollection();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();

            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            
            _mapper = MappingProfileHelper.GetMapper();

            _mockDynamoDbProvider.Setup(x =>
                    x.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE,
                        It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE,
                        TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_testTokenHelper.JwtAudience, TestDataHelper.TEST_INVITATION_CODE,
                        TestDataHelper.GUEST_JANE.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE));

            var patchGuestHandler = new PatchGuestHandler(Mock.Of<ILogger<PatchGuestHandler>>(), _mockDynamoDbProvider.Object, _mapper);

            serviceCollection.AddScoped(_ => patchGuestHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            Sut = new Wedding.Lambdas.Guest.Patch.Function(serviceProvider);
        }

        [TestCase(true)]
        [TestCase(false)]
        public async Task TestPatchFunction_JustAgeGroup(bool isSelf)
        {
            try
            {
                var guestIdToPatch = isSelf ? TestDataHelper.GUEST_JOHN.GuestId : TestDataHelper.GUEST_JANE.GuestId;
                var mutableDto = TestDataHelper.GUEST_JOHN;

                var patchRequest = new PatchGuestRequest
                {
                    GuestId = guestIdToPatch,
                    AgeGroup = AgeGroupEnum.Baby
                };

                _mockDynamoDbProvider!
                    .Setup(x => x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, guestIdToPatch, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(_mapper!.Map<WeddingEntity>(mutableDto));

                _mockDynamoDbProvider!
                    .Setup(x => x.SaveAsync(_testTokenHelper!.JwtAudience, It.IsAny<WeddingEntity>(), It.IsAny<CancellationToken>()))
                    .Callback<string, WeddingEntity, CancellationToken>((aud, updatedEntity, ct) =>
                    {
                        mutableDto = _mapper.Map<GuestDto>(updatedEntity);
                    })
                    .Returns(Task.CompletedTask);

                _mockDynamoDbProvider!
                    .Setup(x => x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, TestDataHelper.TEST_INVITATION_CODE, guestIdToPatch, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(() => _mapper.Map<WeddingEntity>(mutableDto));

                var context = new TestLambdaContext();
                var request = TestRequestHelper.RequestAsJohn(patchRequest);

                var response = await Sut!.FunctionHandler(request, context);
                var result = response.GetResponseBodyData<GuestDto>();

                result.Should().NotBeNull();
                result!.AgeGroup.Should().Be(AgeGroupEnum.Baby);
            }
            catch (Exception ex)
            {
                Assert.Fail(ex.Message);
            }
        }

        [Test]
        public async Task PatchFunction_ShouldFail_IfNotInFamily()
        {
            var guestIdToPatch = TestDataHelper.GUEST_ADMIN.GuestId;
            var patchRequest = new PatchGuestRequest
            {
                GuestId = guestIdToPatch,
                AgeGroup = AgeGroupEnum.Baby
            };

            _mockDynamoDbProvider!
                .Setup(x => x.LoadGuestByGuestIdAsync(_testTokenHelper!.JwtAudience, 
                    TestDataHelper.GUEST_JOHN.InvitationCode, guestIdToPatch, It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);

            var context = new TestLambdaContext();
            var request = TestRequestHelper.RequestAsJohn(patchRequest);

            var response = await Sut!.FunctionHandler(request, context);
            var result = response.GetResponseBodyError();

            result.Should().NotBeNull();
            result.Error.Should().Be("System.UnauthorizedAccessException");
            result.Description.Should().Be($"Authorization exception: Guest not found: Audience: {_testTokenHelper!.JwtAudience}, GuestId: {guestIdToPatch}");
            result.Status.Should().Be((int)HttpStatusCode.Unauthorized);
        }
    }
}
