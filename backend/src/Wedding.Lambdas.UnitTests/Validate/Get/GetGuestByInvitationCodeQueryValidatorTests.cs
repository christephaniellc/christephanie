using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Validate.InvitationCode.Commands;
using Wedding.Lambdas.Validate.InvitationCode.Validation;

namespace Wedding.Lambdas.UnitTests.Validate.Get
{
    [UnitTestsFor(typeof(GetGuestByInvitationCodeQueryValidator))]
    [TestFixture]
    public class GetGuestByInvitationCodeQueryValidatorTests
    {
        private GetGuestByInvitationCodeQueryValidator _validator;

        [SetUp]
        public void Setup()
        {
            _validator = new GetGuestByInvitationCodeQueryValidator();
        }

        [Test]
        public void Validate_InvitationCode_IsNull_ShouldHaveValidationError()
        {
            // Arrange
            var query = new GetGuestByInvitationCodeQuery(null, "John");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.InvitationCode)
                .WithErrorMessage("'Invitation Code' must not be empty."); // Default error message for NotEmpty
        }

        [Test]
        public void Validate_InvitationCode_IsEmpty_ShouldHaveValidationError()
        {
            // Arrange
            var query = new GetGuestByInvitationCodeQuery("","John");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.InvitationCode)
                .WithErrorMessage("'Invitation Code' must not be empty."); // Default error message for NotEmpty
        }

        [Test]
        public void Validate_FirstName_IsEmpty_ShouldHaveValidationError()
        {
            // Arrange
            var query = new GetGuestByInvitationCodeQuery("RSVP123", "");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.FirstName)
                .WithErrorMessage("First name cannot be empty");
        }

        [Test]
        public void Validate_ValidQuery_ShouldNotHaveValidationErrors()
        {
            // Arrange
            var query = new GetGuestByInvitationCodeQuery("RSVP123","John");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Validate_InvalidInvitationCode_ShouldUseRsvpCodeValidator()
        {
            // Arrange
            var query = new GetGuestByInvitationCodeQuery("INVALID_CODE", "John");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.InvitationCode)
                .WithErrorMessage("Invalid RSVP code format."); // Assuming RsvpCodeValidator provides this message
        }
    }
}
