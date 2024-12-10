using System.Collections.Generic;
using FluentValidation.TestHelper;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation;

namespace Wedding.PublicApi.Logic.UnitTests.Areas.FamilyUnit.Validation
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
            var command = new CreateFamilyUnitCommand(null);
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnit);
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_RsvpCode_Is_Empty()
        {
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    RsvpCode = string.Empty
                }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnit.RsvpCode);
        }

        [Test]
        public void Should_Have_Error_When_RsvpCode_Is_NotValid()
        {
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    RsvpCode = "sldkfsdfsdfj"
                }
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnit.RsvpCode);
        }

        [Test]
        public void Should_Not_Have_Error_When_Command_Is_Valid()
        {
            var command = new CreateFamilyUnitCommand(
                new FamilyUnitDto
                {
                    RsvpCode = "ABCDE",
                    Guests = new List<GuestDto> { VALID_GUEST }
                }
            );
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
