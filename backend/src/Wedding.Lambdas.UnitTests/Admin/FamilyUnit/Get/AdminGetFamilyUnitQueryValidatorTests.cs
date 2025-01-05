using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminGetFamilyUnitQueryValidator))]
    public class AdminGetFamilyUnitQueryValidatorTests
    {
        private AdminGetFamilyUnitQueryValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new AdminGetFamilyUnitQueryValidator();
        }

        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
