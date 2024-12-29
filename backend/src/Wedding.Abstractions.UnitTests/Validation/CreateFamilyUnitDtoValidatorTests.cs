using FluentValidation.TestHelper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(CreateFamilyUnitDtoValidator))]
    public class CreateFamilyUnitDtoValidatorTests
    {
        private CreateFamilyUnitDtoValidator _validator;

        [SetUp]
        public void SetUp()
        {
            _validator = new CreateFamilyUnitDtoValidator();
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Invalid()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto
            {
                InvitationCode = "123",
                Guests = new List<GuestDto>
                {
                    new GuestDto
                    {
                        FirstName = "Joe",
                        LastName = "Blow"
                    }
                }
            };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.InvitationCode);
        }

        [Test]
        public void Should_Have_Error_When_PrimaryGuest_Is_Invalid()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "A",
                Guests = new List<GuestDto> { new GuestDto { FirstName = null! } }
            };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor("Guests[0].FirstName");
        }

        [TestCase("A", true)]
        [TestCase("B", true)]
        [TestCase("C", true)]
        [TestCase("A+", true)]
        [TestCase("A-", true)]
        [TestCase("F+", true)]
        [TestCase("F-", true)]
        [TestCase("A++", false)]
        [TestCase("A--", false)]
        [TestCase("A+-", false)]
        [TestCase("A-+", false)]
        [TestCase("", false)]
        [TestCase("AA", false)]
        [TestCase("Z", false)]
        [TestCase("G-", false)]
        [TestCase("F+extra", false)]
        [TestCase("1A", false)]
        public void Should_Have_Valid_Tier(string tier, bool isValid)
        {
            // Arrange
            var familyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = tier,
                Guests = new List<GuestDto> {
                    new GuestDto
                    {
                        FirstName = "John",
                        LastName = "Doe",
                        AgeGroup = AgeGroupEnum.Adult
                    }
                }
            };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            if (isValid)
            {
                result.ShouldNotHaveValidationErrorFor(f => f.Tier);
            }
            else
            {
                result.ShouldHaveValidationErrorFor(f => f.Tier);
            }
        }

        [Test]
        public void Should_Have_Error_When_AdditionalGuest_Is_Invalid()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "A",
                Guests = new List<GuestDto> { 
                    new GuestDto
                    {
                        FirstName = "John",
                        LastName = "Doe",
                        AgeGroup = AgeGroupEnum.Adult
                    },
                    new GuestDto
                    {
                        FirstName = string.Empty
                    }
                }
            };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor("Guests[1].FirstName");
            result.ShouldHaveValidationErrorFor("Guests[1].LastName");
        }

        [Test]
        public void Should_Not_Have_Error_When_FamilyUnitDto_Is_Valid()
        {
            // Arrange
            var familyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "A",
                Guests = new List<GuestDto> {
                    new GuestDto
                    {
                        FirstName = "John",
                        LastName = "Doe",
                        AgeGroup = AgeGroupEnum.Adult
                    },
                    new GuestDto
                    {
                        FirstName = "Jane",
                        LastName = "Doe",
                        AgeGroup = AgeGroupEnum.Adult
                    }
                }
            };

            // Act & Assert
            var result = _validator.TestValidate(familyUnit);
            result.ShouldNotHaveValidationErrorFor(f => f.InvitationCode);
            result.ShouldNotHaveValidationErrorFor(f => f.Guests![0].FirstName);
            result.ShouldNotHaveValidationErrorFor(f => f.Guests![0].LastName);
            result.ShouldNotHaveValidationErrorFor(f => f.Guests![0].AgeGroup);
            result.ShouldNotHaveValidationErrorFor(f => f.Guests![1].FirstName);
            result.ShouldNotHaveValidationErrorFor(f => f.Guests![1].LastName);
            result.ShouldNotHaveValidationErrorFor(f => f.Guests![1].AgeGroup);
        }
    }
}
