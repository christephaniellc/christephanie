using FluentValidation.TestHelper;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation.Utility
{
    [TestFixture]
    [UnitTestsFor(typeof(ArnValidator))]
    public class ArnValidatorTests
    {
        private ArnValidator _validator;

        [SetUp]
        public void Setup()
        {
            _validator = new ArnValidator();
        }

        [Test]
        public void Should_Validate_When_Arn_Is_Valid()
        {
            // Arrange
            var validArn = "arn:aws:lambda:us-east-1:123456789012:function:MyFunction";

            // Act & Assert
            var result = _validator.TestValidate(validArn);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Have_Error_When_Arn_Is_Empty()
        {
            // Arrange
            var emptyArn = string.Empty;

            // Act & Assert
            var result = _validator.TestValidate(emptyArn);
            result.ShouldHaveValidationErrorFor(arn => arn)
                  .WithErrorMessage("Arn cannot be empty.");
        }

        [Test]
        public void Should_Have_Error_When_Arn_Does_Not_Start_With_Expected_Prefix()
        {
            // Arrange
            var invalidArn = "arn:aws:s3:us-east-1:123456789012:bucket:MyBucket";

            // Act & Assert
            var result = _validator.TestValidate(invalidArn);
            result.ShouldHaveValidationErrorFor(arn => arn)
                  .WithErrorMessage("Invalid arn.");
        }

        [Test]
        public void Should_Have_Error_When_Arn_Does_Not_Contain_Function()
        {
            // Arrange
            var invalidArn = "arn:aws:lambda:us-east-1:123456789012:MyFunction";

            // Act & Assert
            var result = _validator.TestValidate(invalidArn);
            result.ShouldHaveValidationErrorFor(arn => arn)
                  .WithErrorMessage("Invalid arn.");
        }

        [Test]
        public void Should_Have_Error_When_Arn_Is_Whitespace()
        {
            // Arrange
            var whitespaceArn = "    ";

            // Act & Assert
            var result = _validator.TestValidate(whitespaceArn);
            result.ShouldHaveValidationErrorFor(arn => arn)
                  .WithErrorMessage("Arn cannot be empty.");
        }
    }
}
