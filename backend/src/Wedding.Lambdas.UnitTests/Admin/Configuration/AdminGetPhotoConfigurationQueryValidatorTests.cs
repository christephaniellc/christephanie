using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.Configuration.Invitation.Validation;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.Configuration
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminGetPhotoConfigurationQueryValidator))]
    public class AdminGetPhotoConfigurationQueryValidatorTests
    {
        private AdminGetPhotoConfigurationQueryValidator? Sut;

        [SetUp]
        public void SetUp()
        {
            Sut = new AdminGetPhotoConfigurationQueryValidator();
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
