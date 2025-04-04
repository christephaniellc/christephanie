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
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Guest.MaskedValues.Get.Handlers;
using Wedding.Lambdas.UnitTests.TestData;
using Newtonsoft.Json;

namespace Wedding.Lambdas.UnitTests.Guest.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.Guest.MaskedValues.Get.Function))]
    public class GetMaskedValuesFunctionTests
    {
        private IMapper? _mapper;
        private Mock<IDynamoDBProvider>? _mockDynamoDbProvider;
        private TestTokenHelper? _testTokenHelper;
        private AuthContext? _fakeAuthContext;
        private Wedding.Lambdas.Guest.MaskedValues.Get.Function? Sut;

        [SetUp]
        public void SetUp()
        {
            var serviceCollection = new ServiceCollection();
            _mockDynamoDbProvider = new Mock<IDynamoDBProvider>();
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                Roles = string.Join(",", TestDataHelper.GUEST_JOHN.Roles),
                Name = TestDataHelper.GUEST_JOHN.FirstName + " " + TestDataHelper.GUEST_JOHN.LastName,
                IpAddress = "127.0.0.1"
            };

            _mapper = MappingProfileHelper.GetMapper();

            _mockDynamoDbProvider.Setup(x =>
                    x.LoadFamilyUnitOnlyAsync(_fakeAuthContext.Audience, _fakeAuthContext.InvitationCode,
                        It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.FAMILY_DOE));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_fakeAuthContext.Audience, _fakeAuthContext.InvitationCode,
                        TestDataHelper.GUEST_JOHN.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JOHN));
            _mockDynamoDbProvider.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_fakeAuthContext.Audience, _fakeAuthContext.InvitationCode,
                        TestDataHelper.GUEST_JANE.GuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper.Map<WeddingEntity>(TestDataHelper.GUEST_JANE));

            var getMaskedValueHandler = new GetGuestMaskedValueHandler(Mock.Of<ILogger<GetGuestMaskedValueHandler>>(), _mockDynamoDbProvider.Object, _mapper);

            serviceCollection.AddScoped(_ => getMaskedValueHandler);
            var serviceProvider = serviceCollection.BuildServiceProvider();

            Sut = new Wedding.Lambdas.Guest.MaskedValues.Get.Function(serviceProvider);
        }

        [TestCase(NotificationPreferenceEnum.Email, "test@example.com")]
        [TestCase(NotificationPreferenceEnum.Text, "+15551234567")]
        public async Task FunctionHandler_Should_Return_Unmasked_Value_When_RequestIsValid_wip(NotificationPreferenceEnum preferenceType, string expectedValue)
        {
            // Arrange
            var guestId = TestDataHelper.GUEST_JOHN.GuestId;

            // Add test-specific setup for the expected value based on the preferenceType
            var guestWithValue = TestDataHelper.GUEST_JOHN;
            
            if (preferenceType == NotificationPreferenceEnum.Email)
            {
                guestWithValue.Email = new VerifiedDto
                {
                    Value = expectedValue,
                    Verified = true
                };
            }
            else
            {
                guestWithValue.Phone = new VerifiedDto
                {
                    Value = expectedValue,
                    Verified = true
                };
            }

            _mockDynamoDbProvider!.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_fakeAuthContext!.Audience, _fakeAuthContext.InvitationCode,
                        guestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(_mapper!.Map<WeddingEntity>(guestWithValue));

            var apiGatewayRequest = TestRequestHelper.RequestAsJohn(queryStringParams: new Dictionary<string, string>
            {
                {"guestId", guestId},
                {"maskedValueType", preferenceType.ToString()}
            });

            var context = new TestLambdaContext();

            // Act
            var response = await Sut!.FunctionHandler(apiGatewayRequest, context); 
            var unmaskedValue = JsonConvert.DeserializeObject<string>(response.Body);

            // Assert that the unmasked value matches the expected value
            unmaskedValue.Should().Be(expectedValue);

            // Assert
            response.StatusCode.Should().Be((int)HttpStatusCode.OK);
        }

        [Test]
        public async Task FunctionHandler_Should_Return_BadRequest_When_RequestIsInvalid_wip()
        {
            // Arrange
            var apiGatewayRequest = TestRequestHelper.RequestAsJohn(queryStringParams: new Dictionary<string, string>
            {
                {"guestId", null!},
                {"maskedValueType", NotificationPreferenceEnum.Email.ToString()}
            });

            var context = new TestLambdaContext();

            // Act
            var response = await Sut!.FunctionHandler(apiGatewayRequest, context);

            // Assert
            response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        }

        [Test]
        public async Task FunctionHandler_Should_Return_Unauthorized_When_GuestNotFound_wip()
        {
            // Arrange
            var nonExistentGuestId = Guid.NewGuid().ToString();

            _mockDynamoDbProvider!.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_fakeAuthContext!.Audience, _fakeAuthContext.InvitationCode,
                        nonExistentGuestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((WeddingEntity)null!);

            var apiGatewayRequest = TestRequestHelper.RequestAsJohn(queryStringParams: new Dictionary<string, string>
            {
                {"guestId", nonExistentGuestId},
                {"maskedValueType", NotificationPreferenceEnum.Email.ToString()}
            });

            var context = new TestLambdaContext();

            // Act
            var response = await Sut!.FunctionHandler(apiGatewayRequest, context);

            // Assert
            response.StatusCode.Should().Be((int)HttpStatusCode.Unauthorized);
        }
        
        [Test]
        public async Task FunctionHandler_Should_Return_InternalServerError_When_UnexpectedErrorOccurs_wip()
        {
            // Arrange
            var guestId = TestDataHelper.GUEST_JOHN.GuestId;
            
            // Setup to throw an unexpected exception
            _mockDynamoDbProvider!.Setup(x =>
                    x.LoadGuestByGuestIdAsync(_fakeAuthContext!.Audience, _fakeAuthContext.InvitationCode,
                        guestId, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Unexpected error"));
            
            var apiGatewayRequest = TestRequestHelper.RequestAsJohn(queryStringParams: new Dictionary<string, string>
            {
                {"guestId", guestId},
                {"maskedValueType", NotificationPreferenceEnum.Email.ToString()}
            });

            var context = new TestLambdaContext();

            // Act
            var response = await Sut!.FunctionHandler(apiGatewayRequest, context);

            // Assert
            response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        }
    }
}