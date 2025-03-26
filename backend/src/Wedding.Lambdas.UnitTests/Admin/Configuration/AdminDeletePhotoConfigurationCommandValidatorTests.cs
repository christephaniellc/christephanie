using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.Configuration.Invitation.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.Configuration
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminDeletePhotoConfigurationCommandValidator))]
    public class AdminDeletePhotoConfigurationCommandValidatorTests
    {
        private AdminDeletePhotoConfigurationCommandValidator? Sut;

        [SetUp]
        public void SetUp()
        {
            Sut = new AdminDeletePhotoConfigurationCommandValidator();
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
