using NUnit.Framework;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Lambdas.UnitTests.Authorize.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(MailingAddressValidator))]
    public class MailingAddressValidatorTests
    {
        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
