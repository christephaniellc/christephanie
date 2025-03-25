using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.Configuration.Invitation.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.Configuration
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminSavePhotoConfigurationCommandValidator))]
    public class AdminSavePhotoConfigurationCommandValidatorTests
    {
        private AdminSavePhotoConfigurationCommandValidator? Sut;

        [SetUp]
        public void SetUp()
        {
            Sut = new AdminSavePhotoConfigurationCommandValidator();
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
