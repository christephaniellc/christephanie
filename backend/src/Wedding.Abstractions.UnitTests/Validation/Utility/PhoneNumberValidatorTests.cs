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
    }
}
