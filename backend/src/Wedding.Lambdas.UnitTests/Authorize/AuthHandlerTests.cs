using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Authorize.Handlers;

namespace Wedding.Lambdas.UnitTests.Authorize
{
    [TestFixture]
    [UnitTestsFor(typeof(AuthHandler))]
    public class AuthHandlerTests
    {
        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
