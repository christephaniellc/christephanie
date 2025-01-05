using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Create
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminCreateFamilyUnitsCommandValidator))]
    public class AdminCreateFamilyUnitsCommandValidatorTests
    {
        private AdminCreateFamilyUnitsCommandValidator _validator;

        private static readonly GuestDto VALID_GUEST = new GuestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = ""
        };

        [SetUp]
        public void SetUp()
        {
            _validator = new AdminCreateFamilyUnitsCommandValidator();
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnits_Are_Null()
        {
            var command = new AdminCreateFamilyUnitsCommand(null!, new List<RoleEnum> { RoleEnum.Admin });
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnits);
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_InvitationCode_Is_Empty()
        {
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                    new FamilyUnitDto
                    {
                        InvitationCode = string.Empty
                    }},
                new List<RoleEnum> { RoleEnum.Admin }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnits[0].InvitationCode");
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_NotValid()
        {
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                    new FamilyUnitDto
                    {
                        InvitationCode = "sldkfsdfsdfj"
                    }}, 
                new List<RoleEnum> { RoleEnum.Admin }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnits[0].InvitationCode");
        }

        [Test]
        public void Should_Have_Error_When_Tier_Is_NotValid()
        {
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "Animal"
                }},
                new List<RoleEnum> { RoleEnum.Admin }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnits[0].Tier");
        }

        [Test]
        public void Should_Have_Error_When_No_Guests()
        {
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE"
                }},
                new List<RoleEnum> { RoleEnum.Admin }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnits[0].Guests");
        }

        [Test]
        public void Should_Not_Have_Error_When_Command_Is_Valid()
        {
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "B",
                    Guests = new List<GuestDto> { VALID_GUEST }
                }},
                new List<RoleEnum> { RoleEnum.Admin }
            );
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Have_Error_When_Not_Admin()
        {
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> { new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "B",
                    Guests = new List<GuestDto> { VALID_GUEST }
                }},
                new List<RoleEnum> { RoleEnum.Guest }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.CurrentUserRoles);
        }
    }
}
