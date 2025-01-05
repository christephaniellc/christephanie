using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Authorize.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(ValidateAuthQueryValidator))]
    public class ValidateAuthQueryValidatorTests
    {
        private TestTokenHelper _testTokenHelper;
        private ValidateAuthQueryValidator _validator;

        [SetUp]
        public void Setup()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _validator = new ValidateAuthQueryValidator();
        }

        [Test]
        public async Task Should_Validate_When_All_Fields_Are_Valid()
        {
            // Arrange
            var authority = _testTokenHelper.JwtAuthority;
            var audience = _testTokenHelper.JwtAudience;
            var query = new ValidateAuthQuery(authority,
                audience,
                "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
                await _testTokenHelper.GenerateAuth0Token());

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Have_Error_When_Token_Is_Invalid()
        {
            // Arrange
            var query = new ValidateAuthQuery(
                _testTokenHelper.JwtAuthority,
                _testTokenHelper.JwtAudience,
               "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
                "sdfsdfsdf");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.Token);
        }

        [Test]
        public void Should_Have_Error_When_MethodArn_Is_Invalid()
        {
            // Arrange
            var query = new ValidateAuthQuery(
            _testTokenHelper.JwtAuthority,
            _testTokenHelper.JwtAudience,
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
            var query = new ValidateAuthQuery(
                _testTokenHelper.JwtAuthority,
                _testTokenHelper.JwtAudience,
                "",
                "valid.jwt.token");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.MethodArn)
                  .WithErrorMessage("'Method Arn' must not be empty.");
        }

        [Test]
        public void Should_Have_Error_When_Token_Is_Null()
        {
            // Arrange
            var query = new ValidateAuthQuery(
                _testTokenHelper.JwtAuthority,
                _testTokenHelper.JwtAudience,
                "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
                null);

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.Token);
        }

        [Test]
        public void Should_Have_Error_When_Token_Is_Empty()
        {
            // Arrange
            var query = new ValidateAuthQuery(
                _testTokenHelper.JwtAuthority,
                _testTokenHelper.JwtAudience,
                "arn:aws:lambda:us-east-1:123456789012:function:MyFunction",
                "");

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.Token);
        }
    }
}
