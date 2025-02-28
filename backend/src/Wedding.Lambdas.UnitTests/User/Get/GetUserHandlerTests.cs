using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.User.Get.Handlers;

namespace Wedding.Lambdas.UnitTests.User.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetUserHandler))]
    public class GetUserHandlerTests
    {
        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
