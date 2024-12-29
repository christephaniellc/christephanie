using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Authorize.Providers;

namespace Wedding.Lambdas.UnitTests.Authorize
{
    [TestFixture]
    [UnitTestsFor(typeof(DatabaseRoleProvider))]
    public class DatabaseRoleProviderTests
    {
        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
