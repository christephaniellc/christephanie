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
        // public void Should_Have_Error_When_InvitationCode_Is_Null()
        // {
        //     // Arrange
        //     string invitationCode = null;
        //
        //     // Act & Assert
        //     var result = _validator.TestValidate(invitationCode);
        //     result.ShouldHaveValidationErrorFor(rsvp => rsvp);
        // }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Empty()
        {
            // Arrange
            string invitationCode = string.Empty;

            // Act & Assert
            var result = _validator.TestValidate(invitationCode);
            result.ShouldHaveValidationErrorFor(rsvp => rsvp);
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Invalid_Length()
        {
            // Arrange
            string invitationCode = "ABCD";

            // Act & Assert
            var result = _validator.TestValidate(invitationCode);
            result.ShouldHaveValidationErrorFor(rsvp => rsvp);
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Has_Invalid_Characters()
        {
            // Arrange
            string invitationCode = "ABCDE1";

            // Act & Assert
            var result = _validator.TestValidate(invitationCode);
            result.ShouldHaveValidationErrorFor(rsvp => rsvp);
        }

        [Test]
        public void Should_Not_Have_Error_When_InvitationCode_Is_Valid()
        {
            // Arrange
            string invitationCode = "ABCDE";

            // Act & Assert
            var result = _validator.TestValidate(invitationCode);
            result.ShouldNotHaveValidationErrorFor(rsvp => rsvp);
        }
    }
}
