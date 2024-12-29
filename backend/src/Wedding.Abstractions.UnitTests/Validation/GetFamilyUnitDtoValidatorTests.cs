using FluentValidation.TestHelper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Validation;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(GetFamilyUnitDtoValidator))]
    public class GetFamilyUnitDtoValidatorTests
    {
        private GetFamilyUnitDtoValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new GetFamilyUnitDtoValidator();
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Invalid()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto { InvitationCode = "123" };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.InvitationCode)
                .WithErrorMessage("Invalid code.");
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Empty()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto { InvitationCode = string.Empty };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.InvitationCode)
                .WithErrorMessage("Invalid code.");
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Has_Invalid_Characters()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto { InvitationCode = "ABCDE1" };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.InvitationCode)
                .WithErrorMessage("Invalid code.");
        }

        [Test]
        public void Should_Not_Have_Error_When_InvitationCode_Is_Valid()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto { InvitationCode = "ABCDE" };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldNotHaveValidationErrorFor(f => f.InvitationCode);
        }
    }
}
