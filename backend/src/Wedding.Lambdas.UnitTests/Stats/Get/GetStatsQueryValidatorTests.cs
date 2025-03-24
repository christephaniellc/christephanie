using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Stats.Get.Validation;

namespace Wedding.Lambdas.UnitTests.Stats.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetStatsQueryValidator))]
    public class GetStatsQueryValidatorTests
    {
        private GetStatsQueryValidator? Sut;

        [SetUp]
        public void SetUp()
        {
            Sut = new GetStatsQueryValidator();
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
