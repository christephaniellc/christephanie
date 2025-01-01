using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Delete
{
    [UnitTestsFor(typeof(AdminDeleteFamilyUnitCommandValidator))]
    [TestFixture]
    public class AdminDeleteFamilyUnitCommandValidatorTests
    {
        private AdminDeleteFamilyUnitCommandValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new AdminDeleteFamilyUnitCommandValidator();
        }

        [Test]
        public void Validate_ValidInvitationCode_ShouldNotHaveValidationError()
        {
            // Arrange
            var command = new AdminDeleteFamilyUnitCommand("ABCDE");

            // Act
            var result = _validator.TestValidate(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(cmd => cmd.InvitationCode);
        }

        [Test]
        public void Validate_InvalidInvitationCode_ShouldHaveValidationError()
        {
            // Arrange
            var command = new AdminDeleteFamilyUnitCommand("INVALID!CODE");

            // Act
            var result = _validator.TestValidate(command);

            // Assert
            result.ShouldHaveValidationErrorFor(cmd => cmd.InvitationCode);
        }

        [Test]
        public void Validate_NullInvitationCode_ShouldHaveValidationError()
        {
            // Arrange
            var command = new AdminDeleteFamilyUnitCommand(null);

            // Act
            var result = _validator.TestValidate(command);

            // Assert
            result.ShouldHaveValidationErrorFor(cmd => cmd.InvitationCode);
        }

        [Test]
        public void IsValid_ThrowsException_WhenCommandIsInvalid()
        {
            // Arrange
            var command = new AdminDeleteFamilyUnitCommand("INVALID!CODE");

            // Act & Assert
            Assert.Throws<FluentValidation.ValidationException>(() => _validator.IsValid(command));
        }

        [Test]
        public void IsValid_DoesNotThrowException_WhenCommandIsValid()
        {
            // Arrange
            var command = new AdminDeleteFamilyUnitCommand("ABCDE");

            // Act & Assert
            Assert.DoesNotThrow(() => _validator.IsValid(command));
        }
    }
}
