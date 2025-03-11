using FluentAssertions;
using Wedding.Common.Helpers;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Helpers
{
    [UnitTestsFor(typeof(Common.Helpers.VerificationCodeHelper))]
    [TestFixture]
    public class VerificationCodeHelperTests
    {
        [Test]
        public void ShouldGenerateVerificationCode()
        {
            // Arrange
            var codeLength = 6;

            // Act
            var result = VerificationCodeHelper.GenerateCode();

            // Assert
            result.Should().NotBeNullOrEmpty();
            result.Length.Should().Be(codeLength);
        }
    }
}
