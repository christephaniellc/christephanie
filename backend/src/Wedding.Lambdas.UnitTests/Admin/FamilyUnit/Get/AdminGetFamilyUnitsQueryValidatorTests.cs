using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminGetFamilyUnitsQueryValidator))]
    public class AdminGetFamilyUnitsQueryValidatorTests
    {
        private AdminGetFamilyUnitsQueryValidator? Sut;

        [SetUp]
        public void SetUp()
        {
            Sut = new AdminGetFamilyUnitsQueryValidator();
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
