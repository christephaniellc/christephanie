using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Get.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Validation;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetFamilyUnitQueryValidator))]
    public class GetFamilyUnitQueryValidatorTests
    {
        private GetFamilyUnitQueryValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new GetFamilyUnitQueryValidator();
        }

        [Test]
        public void Should_Have_Error_When_RsvpCode_Is_Null()
        {
            // Arrange
            var query = new GetFamilyUnitQuery { RsvpCode = null };

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.RsvpCode);
        }

        [Test]
        public void Should_Not_Have_Error_When_RsvpCode_Is_Invalid()
        {
            // Arrange
            var query = new GetFamilyUnitQuery { RsvpCode = "ABCDEFGH" };

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.RsvpCode);
        }

        [Test]
        public void Should_Not_Have_Error_When_RsvpCode_Has_Invalid_Chars()
        {
            // Arrange
            var query = new GetFamilyUnitQuery { RsvpCode = "IIIII" };

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.RsvpCode);
        }

        [Test]
        public void Should_Not_Have_Error_When_RsvpCode_Is_Valid()
        {
            // Arrange
            var query = new GetFamilyUnitQuery { RsvpCode = "ABCDE" };

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldNotHaveValidationErrorFor(q => q.RsvpCode);
        }
    }
}
