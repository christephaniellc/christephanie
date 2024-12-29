using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Create
{
    [TestFixture]
    [UnitTestsFor(typeof(CreateFamilyUnitCommandValidator))]
    public class CreateFamilyUnitCommandValidatorTests
    {
        private CreateFamilyUnitCommandValidator _validator;

        private static readonly GuestDto VALID_GUEST = new GuestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = ""
        };

        [SetUp]
        public void SetUp()
        {
            _validator = new CreateFamilyUnitCommandValidator();
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_Is_Null()
        {
            var command = new CreateFamilyUnitCommand(null!);
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnit);
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_InvitationCode_Is_Empty()
        {
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    InvitationCode = string.Empty
                }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnit.InvitationCode);
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_NotValid()
        {
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    InvitationCode = "sldkfsdfsdfj"
                }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnit.InvitationCode);
        }

        [Test]
        public void Should_Have_Error_When_Tier_Is_NotValid()
        {
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "Animal"
                }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnit.Tier);
        }

        [Test]
        public void Should_Have_Error_When_No_Guests()
        {
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE"
                }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnit.Guests);
        }

        [Test]
        public void Should_Not_Have_Error_When_Command_Is_Valid()
        {
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "B",
                    Guests = new List<GuestDto> { VALID_GUEST }
                }
            );
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
