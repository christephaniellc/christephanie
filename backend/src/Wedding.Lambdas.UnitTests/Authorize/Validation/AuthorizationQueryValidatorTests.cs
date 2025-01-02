using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Authorize.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(AuthorizationQueryValidator))]
    public class AuthorizationQueryValidatorTests
    {
        private AuthorizationQueryValidator _validator;

        [SetUp]
        public void Setup()
        {
            _validator = new AuthorizationQueryValidator();
        }

        [Test]
        public void Should_Validate_When_All_Fields_Are_Valid()
        {
            // Arrange
            var authority = "https://valid-authority.com";
            var audience = "valid-audience";
            var query = new ValidateAuthQuery(authority,
                audience,
                "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
                TestTokenHelper.GenerateTestToken(authority, audience));

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Have_Error_When_Token_Is_Invalid()
        {
            // Arrange
            var query = new ValidateAuthQuery("https://valid-authority.com",
                "valid-audience",
               "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
                "");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.Token);
        }

        [Test]
        public void Should_Have_Error_When_MethodArn_Is_Invalid()
        {
            // Arrange
            var query = new ValidateAuthQuery("https://valid-authority.com",
                "valid-audience",
                "invalid:arn",
                "valid.jwt.token");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.MethodArn)
                  .WithErrorMessage("Invalid arn.");
        }

        [Test]
        public void Should_Have_Error_When_MethodArn_Is_Empty()
        {
            // Arrange
            var query = new ValidateAuthQuery("https://valid-authority.com",
                "valid-audience",
                "",
                "valid.jwt.token");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.MethodArn)
                  .WithErrorMessage("'MethodArn' must not be empty.");
        }

        [Test]
        public void Should_Have_Error_When_Token_Is_Null()
        {
            // Arrange
            var query = new ValidateAuthQuery( "https://valid-authority.com",
                "valid-audience",
                "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
                null);

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.Token);
        }
    }
}
