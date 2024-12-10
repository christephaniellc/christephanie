using FluentValidation.TestHelper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Validation;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(UpdateFamilyUnitDtoValidator))]
    public class UpdateFamilyUnitDtoValidatorTests
    {
        private UpdateFamilyUnitDtoValidator _validator;

        [SetUp]
        public void Setup()
        {
            _validator = new UpdateFamilyUnitDtoValidator();
        }

        [Test]
        public void Should_Have_Error_When_RsvpCode_Is_Invalid()
        {
            var familyUnit = new FamilyUnitDto
            {
                RsvpCode = "invalid_code",
                Tier = "Tier1",
                Guests = new List<GuestDto> { new GuestDto() }
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.RsvpCode);
        }

        [Test]
        public void Should_Have_Error_When_Tier_Is_Invalid()
        {
            var familyUnit = new FamilyUnitDto
            {
                RsvpCode = "valid_code",
                Tier = "InvalidTier",
                Guests = new List<GuestDto> { new GuestDto() }
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.Tier);
        }

        [Test]
        public void Should_Have_Error_When_Guests_Is_Null()
        {
            var familyUnit = new FamilyUnitDto
            {
                RsvpCode = "valid_code",
                Tier = "Tier1",
                Guests = null
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.Guests);
        }

        [Test]
        public void Should_Have_Error_When_Guests_Is_Empty()
        {
            var familyUnit = new FamilyUnitDto
            {
                RsvpCode = "valid_code",
                Tier = "Tier1",
                Guests = new List<GuestDto>()
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.Guests);
        }

        [Test]
        public void Should_Have_Error_When_Guests_Count_Is_Zero()
        {
            var familyUnit = new FamilyUnitDto
            {
                RsvpCode = "valid_code",
                Tier = "Tier1",
                Guests = new List<GuestDto>()
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.Guests);
        }

        [Test]
        public void Should_Not_Have_Error_When_Guests_Count_Is_Greater_Than_Zero()
        {
            var familyUnit = new FamilyUnitDto
            {
                RsvpCode = "valid_code",
                Tier = "Tier1",
                Guests = new List<GuestDto> { new GuestDto() }
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldNotHaveValidationErrorFor(f => f.Guests);
        }

        [Test]
        public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
        {
            var familyUnit = new FamilyUnitDto
            {
                RsvpCode = "valid_code",
                Tier = "Tier1",
                Guests = new List<GuestDto> { new GuestDto() }
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
