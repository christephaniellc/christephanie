using FluentValidation.TestHelper;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation.Utility
{
    [TestFixture]
    [UnitTestsFor(typeof(PhoneNumberValidator))]
    public class PhoneNumberValidatorTests
    {
        private PhoneNumberValidator _validator;

        [SetUp]
        public void Setup()
        {
            _validator = new PhoneNumberValidator();
        }

        [TestCase("+15555555555")]
        [TestCase("5555555555")]
        [TestCase("555-555-5555")]
        [TestCase("(555) 555-5555")]
        [TestCase("555.555.5555")]
        [TestCase("+1 (123) 456-7890")]
        [TestCase("+44 20 7946 0958")]
        [TestCase("+91-98765-43210")]
        [TestCase("123-456-7890")]
        [TestCase("(123) 456-7890")]
        [TestCase("123.456.7890")]
        [TestCase("+33123456789")]
        public void ShouldValidateGoodPhoneNumbers(string phoneNumber)
        {
            var result = _validator.TestValidate(phoneNumber);
            result.ShouldNotHaveAnyValidationErrors();
        }

        //[TestCase(null, "Phone number cannot be null.")] // Null value
        [TestCase("", "Phone number cannot be empty.")] // Empty string
        [TestCase(" ", "Phone number cannot be empty.")] // Whitespace
        [TestCase("abc123", "Invalid phone number.")] // Contains letters
        [TestCase("+", "Invalid phone number.")] // Just a plus sign
        [TestCase("123", "Invalid phone number.")] // Too short
        [TestCase("++1234567890", "Invalid phone number.")] // Double plus
        [TestCase("123-abc-4567", "Invalid phone number.")] // Contains non-numeric characters
        [TestCase("423-456-78901", "Invalid phone number.")] // Too many digits
        [TestCase("0000000000", "Invalid phone number.")] // All zeroes
        [TestCase("+123 (456) 789-000000000000", "Invalid phone number.")] // Too long
        [TestCase("12-34-56-78-90", "Invalid phone number.")] // Incorrect grouping
        [TestCase("123 4567 89012", "Invalid phone number.")] // Wrong format
        public void Should_HaveValidationError_For_InvalidPhoneNumbers(string input, string expectedErrorMessage)
        {
            var result = _validator!.TestValidate(input);

            //Assert.Fail();

            result.ShouldHaveValidationErrorFor(x => x)
                .WithErrorMessage(expectedErrorMessage);
        }
    }
}
