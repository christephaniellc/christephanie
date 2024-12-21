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
        public void Should_Have_Error_When_RsvpCode_Is_Invalid()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto { RsvpCode = "123" };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.RsvpCode)
                .WithErrorMessage("Invalid code.");
        }

        [Test]
        public void Should_Have_Error_When_RsvpCode_Is_Empty()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto { RsvpCode = string.Empty };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.RsvpCode)
                .WithErrorMessage("Invalid code.");
        }

        [Test]
        public void Should_Have_Error_When_RsvpCode_Has_Invalid_Characters()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto { RsvpCode = "ABCDE1" };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.RsvpCode)
                .WithErrorMessage("Invalid code.");
        }

        [Test]
        public void Should_Not_Have_Error_When_RsvpCode_Is_Valid()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto { RsvpCode = "ABCDE" };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldNotHaveValidationErrorFor(f => f.RsvpCode);
        }
    }
}
