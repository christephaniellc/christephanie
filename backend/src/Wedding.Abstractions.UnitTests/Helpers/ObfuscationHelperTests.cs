using FluentAssertions;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Helpers
{
    [UnitTestsFor(typeof(ObfuscationHelper))]
    [TestFixture]
    public class ObfuscationHelperTests
    {
        [TestCase("234567890", "+1-XXX-XXX-7890")]
        [TestCase("+1234567890", "+1-XXX-XXX-7890")]
        [TestCase("+491234567890", "+49-XXXX-XX7890")]
        [TestCase("123", "123")]
        [TestCase(null, "")]
        public void ShouldObfuscatePhone(string? number, string expectedResult)
        {

            // Arrange & Act
            var result = ObfuscationHelper.MaskPhone(number);

            // Assert
            result.Should().Be(expectedResult);
        }

        [TestCase("john.doe@gmail.com", "j***e@gmail.com")]
        [TestCase("a@gmail.com", "a***@gmail.com")]
        [TestCase("ab@gmail.com", "a***@gmail.com")]
        [TestCase("abc@gmail.com", "a***c@gmail.com")]
        [TestCase("invalidemail", "invalidemail")]
        [TestCase(null, "")]
        [TestCase("", "")]
        public void ShouldObfuscateEmail(string? email, string? expectedResult)
        {

            // Arrange & Act
            var result = ObfuscationHelper.MaskEmail(email);

            // Assert
            result.Should().Be(expectedResult);
        }
    }
}
