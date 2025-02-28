using FluentValidation.TestHelper;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation.Utility
{
    [TestFixture]
    [UnitTestsFor(typeof(EmailValidator))]
    public class EmailValidatorTests
    {
        private EmailValidator Sut;

        [SetUp]
        public void Setup()
        {
            Sut = new EmailValidator();
        }

        [TestCase("john.doe@gmail.com", true)]
        [TestCase("jane_doe@domain.co", true)]
        [TestCase("user.name+tag+sorting@example.com", true)]
        [TestCase("plainaddress", false)]
        [TestCase("", false)]
        [TestCase("john.doe@.com", false)]
        [TestCase("john.doe@domain", false)]
        [TestCase("john..doe@mail.com", false)]
        public void ShouldValidateEmail(string email, bool valid)
        {
            var result = Sut.TestValidate(email);

            if (valid)
            {
                result.ShouldNotHaveAnyValidationErrors();
            }
            else
            {
                result.ShouldHaveValidationErrorFor(email => email);
            }
        }
    }
}
