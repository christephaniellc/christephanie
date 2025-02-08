using FluentValidation.TestHelper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(CreateGuestDtoValidator))]
    public class CreateGuestDtoValidatorTests
    {
        private CreateGuestDtoValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new CreateGuestDtoValidator();
        }

        [Test]
        public void Should_Have_Error_When_FirstName_Is_Empty()
        {
            // Arrange
            var guest = new GuestDto { FirstName = string.Empty,
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            // Act & Assert
            var result = _validator.TestValidate(guest);
            result.ShouldHaveValidationErrorFor(g => g.FirstName)
                .WithErrorMessage("First name cannot be null, empty or consist of only whitespace characters.");
        }

        [Test]
        public void Should_Have_Error_When_LastName_Is_Empty_And_Not_Plus1()
        {
            // Arrange
            var guest = new GuestDto { LastName = string.Empty,
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            // Act & Assert
            var result = _validator.TestValidate(guest);
            result.ShouldHaveValidationErrorFor(g => g.LastName)
                .WithErrorMessage("Last name cannot be null, empty or consist of only whitespace characters.");
        }

        [Test]
        public void Should_Not_Have_Error_When_LastName_Is_Empty_And_Is_Plus1()
        {
            // Arrange
            var guest = new GuestDto
            {
                FirstName = "+1",
                LastName = string.Empty,
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            // Act & Assert
            var result = _validator.TestValidate(guest);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Have_Error_When_AgeGroup_Is_Invalid()
        {
            // Arrange
            var guest = new GuestDto { AgeGroup = (AgeGroupEnum) 999,
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            // Act & Assert
            var result = _validator.TestValidate(guest);
            result.ShouldHaveValidationErrorFor(g => g.AgeGroup);
        }

        [Test]
        public void Should_Not_Have_Error_When_GuestDto_Is_Valid()
        {
            // Arrange
            var guest = new GuestDto
            {
                FirstName = "John",
                LastName = "Doe",
                AgeGroup = AgeGroupEnum.Adult,
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            // Act & Assert
            var result = _validator.TestValidate(guest);
            result.ShouldNotHaveValidationErrorFor(g => g.FirstName);
            result.ShouldNotHaveValidationErrorFor(g => g.LastName);
            result.ShouldNotHaveValidationErrorFor(g => g.AgeGroup);
        }
    }
}
