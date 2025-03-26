using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.Configuration.Invitation.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.Configuration
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminGetPhotoConfigurationsQueryValidator))]
    public class AdminGetPhotoConfigurationsQueryValidatorTests
    {
        private AdminGetPhotoConfigurationsQueryValidator? Sut;

        [SetUp]
        public void SetUp()
        {
            Sut = new AdminGetPhotoConfigurationsQueryValidator();
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
