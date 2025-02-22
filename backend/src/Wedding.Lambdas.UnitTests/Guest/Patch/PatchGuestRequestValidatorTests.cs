using FluentValidation;
using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Guest.Patch.Requests;
using Wedding.Lambdas.Guest.Patch.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Guest.Patch
{
    [TestFixture]
    [UnitTestsFor(typeof(PatchGuestRequestValidator))]
    public class PatchGuestRequestValidatorTests
    {
        private PatchGuestRequestValidator? Sut;
        private TestTokenHelper? _testTokenHelper;
        private AuthContext? _fakeAuthContext;

        [SetUp]
        public void SetUp()
        {
            Sut = new PatchGuestRequestValidator();
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles),
                IpAddress = "127.0.0.1"
            };
        }

        [Test]
        public void Should_Pass_For_Valid_Request()
        {
            // Arrange: create a valid request
            var request = new PatchGuestRequest
            {
                GuestId = Guid.NewGuid().ToString(),
                AgeGroup = AgeGroupEnum.Adult,
                Email = "test@example.com",
                Phone = "202-456-7890",
                InvitationResponse = InvitationResponseEnum.Interested,
                RehearsalDinner = RsvpEnum.Declined,            
                FourthOfJuly = RsvpEnum.Attending,                  
                Wedding = RsvpEnum.Attending,                            
                NotificationPreference = new List<NotificationPreferenceEnum>
                {
                    NotificationPreferenceEnum.Email 
                },
                SleepPreference = SleepPreferenceEnum.Hotel,         
                FoodPreference = FoodPreferenceEnum.Vegan      
            };

            // Act & Assert: No validation errors should be thrown
            Assert.DoesNotThrow(() => Sut.ValidateAndThrow(request));
        }

        [Test]
        public void Should_Fail_When_GuestId_Is_NullOrEmpty()
        {
            // Arrange: create a request with an empty GuestId
            var request = new PatchGuestRequest
            {
                GuestId = ""
            };

            // Act: validate the request
            var result = Sut.TestValidate(request);

            // Assert: expect a validation error for GuestId
            result.ShouldHaveValidationErrorFor(x => x.GuestId);
        }

        [Test]
        public void Should_Fail_When_Email_Is_Invalid()
        {
            // Arrange: create a request with an invalid email format
            var request = new PatchGuestRequest
            {
                GuestId = Guid.NewGuid().ToString(),
                Email = "invalid-email"
            };

            // Act: validate the request
            var result = Sut.TestValidate(request);

            // Assert: expect a validation error for Email
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Test]
        public void Should_Fail_When_Phone_Is_Invalid()
        {
            // Arrange: create a request with an invalid phone number
            var request = new PatchGuestRequest
            {
                GuestId = Guid.NewGuid().ToString(),
                Phone = "invalid-phone"
            };

            // Act: validate the request
            var result = Sut.TestValidate(request);

            // Assert: expect a validation error for Phone
            result.ShouldHaveValidationErrorFor(x => x.Phone);
        }

        [Test]
        public void Should_Fail_When_NotificationPreference_Contains_Invalid_Enum_Value()
        {
            // Arrange: create a request with an invalid enum value in the list
            // Cast an out-of-range integer to the enum type.
            var invalidEnumValue = (NotificationPreferenceEnum)999;
            var request = new PatchGuestRequest
            {
                GuestId = Guid.NewGuid().ToString(),
                NotificationPreference = new List<NotificationPreferenceEnum> { invalidEnumValue }
            };

            // Act: validate the request
            var result = Sut.TestValidate(request);

            // Assert: expect a validation error for the first element of the NotificationPreference list
            result.ShouldHaveValidationErrorFor("NotificationPreference[0]");
        }
    }
}
