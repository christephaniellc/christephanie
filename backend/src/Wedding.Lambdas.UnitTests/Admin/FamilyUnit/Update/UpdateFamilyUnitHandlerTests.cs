using FluentValidation.TestHelper;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;
using Wedding.Lambdas.FamilyUnit.Update.Commands;
using Wedding.Lambdas.FamilyUnit.Update.Validation;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(UpdateFamilyUnitHandler))]
    public class UpdateFamilyUnitHandlerTests
    {
        private UpdateFamilyUnitCommandValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new UpdateFamilyUnitCommandValidator();
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
            var command = new UpdateFamilyUnitCommand(validFamilyUnit);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_Is_Null()
        {
            // Arrange
            var command = new UpdateFamilyUnitCommand(null);

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
            var command = new UpdateFamilyUnitCommand(invalidFamilyUnit);

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
            var command = new UpdateFamilyUnitCommand(invalidFamilyUnit);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnit.InvitationCode");
        }
    }
}
