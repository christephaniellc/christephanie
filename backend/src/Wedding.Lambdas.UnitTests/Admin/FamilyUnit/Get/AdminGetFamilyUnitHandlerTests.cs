using AutoMapper;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Enums;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Handlers;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminUpdateFamilyUnitHandler))]
    public class AdminGetFamilyUnitHandlerTests
    {
        private AdminGetFamilyUnitHandler? Sut;
        private List<RoleEnum>? _adminRoles;
        private List<RoleEnum>? _nonAdminRoles;

        [SetUp]
        public void SetUp()
        {
            Sut = new AdminGetFamilyUnitHandler(Mock.Of<ILogger<AdminGetFamilyUnitHandler>>(), 
                Mock.Of<IDynamoDBProvider>(), 
                Mock.Of<IMapper>());
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTestsForOneFamily()
        {
            Assert.Fail();
        }

        [Test]
        [Ignore("Write test")]
        public void ShouldWriteTestsForMultipleFamilies()
        {
            Assert.Fail();
        }
    }
}
