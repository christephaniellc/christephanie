using FluentValidation.TestHelper;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation.Utility
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

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Empty()
        {
            // Arrange
            string code = string.Empty;

            // Act & Assert
            var result = _validator.TestValidate(code);
            result.ShouldHaveValidationErrorFor(invitationCode => invitationCode);
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Invalid_Length()
        {
            // Arrange
            string code = "ABCD";

            // Act & Assert
            var result = _validator.TestValidate(code);
            result.ShouldHaveValidationErrorFor(invitationCode => invitationCode);
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Has_Invalid_Characters()
        {
            // Arrange
            string code = "ABCDE1";

            // Act & Assert
            var result = _validator.TestValidate(code);
            result.ShouldHaveValidationErrorFor(invitationCode => invitationCode);
        }

        [Test]
        public void Should_Not_Have_Error_When_InvitationCode_Is_Valid()
        {
            // Arrange
            string code = "ABCDE";

            // Act & Assert
            var result = _validator.TestValidate(code);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Not_Have_Error_When_InvitationCode_Is_Lowercase()
        {
            // Arrange
            string code = "abcde";

            // Act & Assert
            var result = _validator.TestValidate(code);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
