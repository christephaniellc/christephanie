using NUnit.Framework;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminUpdateFamilyUnitHandler))]
    public class AdminUpdateFamilyUnitHandlerTests
    {
        private AdminUpdateFamilyUnitHandler? _handler;
        private List<RoleEnum>? _adminRoles;
        private List<RoleEnum>? _nonAdminRoles;

        [SetUp]
        public void SetUp()
        {
            //_handler = new AdminUpdateFamilyUnitHandler();
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
