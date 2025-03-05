using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Guest.MaskedValues.Get.Requests;
using Wedding.Lambdas.Guest.MaskedValues.Get.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Guest.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetGuestMaskedValueRequestValidator))]
    public class GetGuestMaskedValuesRequestValidatorTests
    {
        private GetGuestMaskedValueRequestValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new GetGuestMaskedValueRequestValidator();
        }

        [Test]
        public void Validate_ShouldPass_WhenGuestIdAndMaskedValueTypeAreValid_wip()
        {
            // Arrange
            var request = new GetGuestMaskedValuesRequest
            {
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                MaskedValueType = NotificationPreferenceEnum.Email
            };

            // Act & Assert
            var result = _validator.TestValidate(request);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Validate_ShouldFail_WhenGuestIdIsEmpty_wip()
        {
            // Arrange
            var request = new GetGuestMaskedValuesRequest
            {
                GuestId = string.Empty,
                MaskedValueType = NotificationPreferenceEnum.Email
            };

            // Act & Assert
            var result = _validator.TestValidate(request);
            result.ShouldHaveValidationErrorFor(x => x.GuestId);
        }

        [Test]
        public void Validate_ShouldFail_WhenGuestIdIsNull_wip()
        {
            // Arrange
            var request = new GetGuestMaskedValuesRequest
            {
                GuestId = null!,
                MaskedValueType = NotificationPreferenceEnum.Email
            };

            // Act & Assert
            var result = _validator.TestValidate(request);
            result.ShouldHaveValidationErrorFor(x => x.GuestId);
        }

        [Test]
        public void Validate_ShouldFail_WhenGuestIdIsInvalidGuid_wip()
        {
            // Arrange
            var request = new GetGuestMaskedValuesRequest
            {
                GuestId = "not-a-guid",
                MaskedValueType = NotificationPreferenceEnum.Email
            };

            // Act & Assert
            var result = _validator.TestValidate(request);
            result.ShouldHaveValidationErrorFor(x => x.GuestId);
        }

        [Test]
        public void Validate_ShouldPass_WithValidMaskedValueTypeEnum_wip()
        {
            // Arrange
            var request = new GetGuestMaskedValuesRequest
            {
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                MaskedValueType = NotificationPreferenceEnum.Text
            };

            // Act & Assert
            var result = _validator.TestValidate(request);
            result.ShouldNotHaveValidationErrorFor(x => x.MaskedValueType);
        }

        [Test]
        public void Validate_ShouldFail_WithInvalidMaskedValueTypeEnum_wip()
        {
            // Arrange
            var request = new GetGuestMaskedValuesRequest
            {
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                MaskedValueType = (NotificationPreferenceEnum)999 // Invalid enum value
            };

            // Act & Assert
            var result = _validator.TestValidate(request);
            result.ShouldHaveValidationErrorFor(x => x.MaskedValueType);
        }
    }
}