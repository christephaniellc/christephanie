using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Guest.MaskedValues.Get.Commands;
using Wedding.Lambdas.Guest.MaskedValues.Get.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Guest.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetMaskedValueCommandValidator))]
    public class GetMaskedValueCommandValidatorTests
    {
        private GetMaskedValueCommandValidator _validator;
        private TestTokenHelper? _testTokenHelper;
        private AuthContext _fakeAuthContext;

        [SetUp]
        public void SetUp()
        {
            _validator = new GetMaskedValueCommandValidator();
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
        }

        [Test]
        public void Validate_ShouldPass_WhenCommandIsValid_wip()
        {
            // Arrange
            var command = new GetMaskedValueCommand(
                _fakeAuthContext,
                TestDataHelper.GUEST_JOHN.GuestId,
                NotificationPreferenceEnum.Email
            );

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Validate_ShouldFail_WhenAuthContextIsNull_wip()
        {
            // Arrange
            var command = new GetMaskedValueCommand(
                null!,
                TestDataHelper.GUEST_JOHN.GuestId,
                NotificationPreferenceEnum.Email
            );

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.AuthContext);
        }

        [Test]
        public void Validate_ShouldFail_WhenGuestIdIsEmpty_wip()
        {
            // Arrange
            var command = new GetMaskedValueCommand(
                _fakeAuthContext,
                string.Empty,
                NotificationPreferenceEnum.Email
            );

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.GuestId);
        }

        [Test]
        public void Validate_ShouldFail_WhenGuestIdIsNull_wip()
        {
            // Arrange
            var command = new GetMaskedValueCommand(
                _fakeAuthContext,
                null!,
                NotificationPreferenceEnum.Email
            );

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.GuestId);
        }

        [Test]
        public void Validate_ShouldFail_WhenGuestIdIsInvalidGuid_wip()
        {
            // Arrange
            var command = new GetMaskedValueCommand(
                _fakeAuthContext,
                "not-a-guid",
                NotificationPreferenceEnum.Email
            );

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.GuestId);
        }

        [Test]
        public void Validate_ShouldFail_WithInvalidMaskedValueTypeEnum_wip()
        {
            // Arrange
            var command = new GetMaskedValueCommand(
                _fakeAuthContext,
                TestDataHelper.GUEST_JOHN.GuestId,
                (NotificationPreferenceEnum)999 // Invalid enum value
            );

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.MaskedValueType);
        }
    }
}