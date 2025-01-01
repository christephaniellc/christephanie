using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminUpdateFamilyUnitCommandValidator))]
    public class AdminUpdateFamilyUnitCommandValidatorTests
    {
        private AdminUpdateFamilyUnitCommandValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new AdminUpdateFamilyUnitCommandValidator();
        }

        [Test]
        public void Should_NotValidate_When_Self_NotAdmin()
        {
            // Arrange
            var command = new AdminUpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE, 
                TestDataHelper.GUEST_JOHN.Roles);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(c => c.UserRoles);
        }

        [Test]
        public void Should_Validate_When_FamilyUnit_Is_Valid_And_Admin()
        {
            // Arrange
            var command = new AdminUpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE,
                TestDataHelper.GUEST_ADMIN.Roles);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_NotValidate_When_FamilyUnit_Is_Valid_And_User_Has_No_Permission()
        {
            // Arrange
            var command = new AdminUpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE,
                TestDataHelper.GUEST_JOHN.Roles);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(c => c.UserRoles);
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_Is_Null()
        {
            // Arrange
            var command = new AdminUpdateFamilyUnitCommand(null,
                TestDataHelper.GUEST_ADMIN.Roles);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(c => c.FamilyUnit)
                .WithErrorMessage("'Family Unit' must not be empty.");
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_Guests_Are_Empty()
        {
            // Arrange
            var invalidFamilyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "Tier1",
                Guests = new List<GuestDto>()
            };
            var command = new AdminUpdateFamilyUnitCommand(invalidFamilyUnit,
            TestDataHelper.GUEST_ADMIN.Roles);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnit.Guests")
                .WithErrorMessage("Must include at least one guest");
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Invalid()
        {
            // Arrange
            var invalidFamilyUnit = new FamilyUnitDto
            {
                InvitationCode = "",
                Tier = "Tier1",
                Guests = new List<GuestDto>
                {
                    new GuestDto { FirstName = "Guest1", Email = "guest1@example.com" }
                }
            };
            var command = new AdminUpdateFamilyUnitCommand(invalidFamilyUnit,
            TestDataHelper.GUEST_ADMIN.Roles);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnit.InvitationCode");
        }
    }
}
