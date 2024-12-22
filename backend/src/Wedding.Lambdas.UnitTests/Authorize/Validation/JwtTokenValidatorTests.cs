using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Authorize.Validation;

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
