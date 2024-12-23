using NUnit.Framework;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Lambdas.UnitTests.Authorize.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(JwtTokenValidator))]
    public class JwtTokenValidatorTests
    {
        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
