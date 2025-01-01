using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminUpdateFamilyUnitHandler))]
    public class AdminUpdateFamilyUnitHandlerTests
    {
        private AdminUpdateFamilyUnitCommandValidator _validator;
        private List<RoleEnum> _adminRoles;
        private List<RoleEnum> _nonAdminRoles;

        [SetUp]
        public void SetUp()
        {
            _validator = new AdminUpdateFamilyUnitCommandValidator();
            _adminRoles = new List<RoleEnum> { RoleEnum.Admin };
            _nonAdminRoles = new List<RoleEnum> { RoleEnum.Guest };
        }

        [Test]
        public void Should_Validate_When_FamilyUnit_Is_Valid()
        {
            // Arrange
            var validFamilyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "A",
                Guests = new List<GuestDto>
                {
                    new GuestDto
                    {
                        FirstName = "Guest1", 
                        LastName = "Last",
                        Email = "guest1@example.com",
                        GuestNumber = 1
                    }
                }
            };
            var command = new AdminUpdateFamilyUnitCommand(validFamilyUnit, _adminRoles);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_Is_Null()
        {
            // Arrange
            var command = new AdminUpdateFamilyUnitCommand(null, _adminRoles);

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
            var command = new AdminUpdateFamilyUnitCommand(invalidFamilyUnit, _adminRoles);

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
            var command = new AdminUpdateFamilyUnitCommand(invalidFamilyUnit, _adminRoles);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnit.UserInvitationCode");
        }

        [Test]
        public void Should_Have_Error_When_User_Not_Admin()
        {
            // Arrange
            var validFamilyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "A",
                Guests = new List<GuestDto>
                {
                    new GuestDto
                    {
                        FirstName = "Guest1",
                        LastName = "Last",
                        Email = "guest1@example.com",
                        GuestNumber = 1
                    }
                }
            };
            var command = new AdminUpdateFamilyUnitCommand(validFamilyUnit, _nonAdminRoles);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnit.UserInvitationCode");
        }
    }
}
