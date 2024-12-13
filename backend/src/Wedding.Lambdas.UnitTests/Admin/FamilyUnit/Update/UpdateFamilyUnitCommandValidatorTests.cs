using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Validation;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(CreateFamilyUnitCommandValidator))]
    public class UpdateFamilyUnitCommandValidatorTests
    {
        private UpdateFamilyUnitCommandValidator _validator;

        private static readonly GuestDto VALID_GUEST = new GuestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = ""
        };

        [SetUp]
        public void SetUp()
        {
            _validator = new UpdateFamilyUnitCommandValidator();
        }

        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
