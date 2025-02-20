using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Get.Handlers;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetFamilyUnitHandler))]
    public class GetFamilyUnitHandlerTests
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}