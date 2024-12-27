using FluentValidation.TestHelper;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(InvitationCodeValidator))]
    public class InvitationCodeValidatorTests
    {
        private InvitationCodeValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new InvitationCodeValidator();
        }

        // [Test]
        // public void Should_Have_Error_When_RsvpCode_Is_Null()
        // {
        //     // Arrange
        //     string rsvpCode = null;
        //
        //     // Act & Assert
        //     var result = _validator.TestValidate(rsvpCode);
        //     result.ShouldHaveValidationErrorFor(rsvp => rsvp);
        // }

        [Test]
        public void Should_Have_Error_When_RsvpCode_Is_Empty()
        {
            // Arrange
            string rsvpCode = string.Empty;

            // Act & Assert
            var result = _validator.TestValidate(rsvpCode);
            result.ShouldHaveValidationErrorFor(rsvp => rsvp);
        }

        [Test]
        public void Should_Have_Error_When_RsvpCode_Is_Invalid_Length()
        {
            // Arrange
            string rsvpCode = "ABCD";

            // Act & Assert
            var result = _validator.TestValidate(rsvpCode);
            result.ShouldHaveValidationErrorFor(rsvp => rsvp);
        }

        [Test]
        public void Should_Have_Error_When_RsvpCode_Has_Invalid_Characters()
        {
            // Arrange
            string rsvpCode = "ABCDE1";

            // Act & Assert
            var result = _validator.TestValidate(rsvpCode);
            result.ShouldHaveValidationErrorFor(rsvp => rsvp);
        }

        [Test]
        public void Should_Not_Have_Error_When_RsvpCode_Is_Valid()
        {
            // Arrange
            string rsvpCode = "ABCDE";

            // Act & Assert
            var result = _validator.TestValidate(rsvpCode);
            result.ShouldNotHaveValidationErrorFor(rsvp => rsvp);
        }
    }
}
