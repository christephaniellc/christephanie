using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.Setup.Validation;
using Wedding.Lambdas.FamilyUnit.Patch.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.Setup
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminSetupCommandValidator))]
    public class AdminSetupCommandValidatorTests
    {
        private PatchFamilyUnitCommandValidator? Sut;
        private TestTokenHelper? _testTokenHelper;

        [SetUp]
        public void SetUp()
        {
            Sut = new PatchFamilyUnitCommandValidator();
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
