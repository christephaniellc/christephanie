using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminGetFamilyUnitQueryValidator))]
    public class AdminGetFamilyUnitQueryValidatorTests
    {
        private AdminGetFamilyUnitQueryValidator? Sut;

        [SetUp]
        public void SetUp()
        {
            Sut = new AdminGetFamilyUnitQueryValidator();
        }

        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
