using NUnit.Framework;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Handlers;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminUpdateFamilyUnitHandler))]
    public class AdminGetFamilyUnitHandlerTests
    {
        private AdminGetFamilyUnitHandler? _handler;
        private List<RoleEnum>? _adminRoles;
        private List<RoleEnum>? _nonAdminRoles;

        [SetUp]
        public void SetUp()
        {
            //_handler = new AdminGetFamilyUnitHandler();
        }

        [Test]
        public void ShouldWriteTestsForOneFamily()
        {
            Assert.Fail();
        }

        [Test]
        public void ShouldWriteTestsForMultipleFamilies()
        {
            Assert.Fail();
        }
    }
}
