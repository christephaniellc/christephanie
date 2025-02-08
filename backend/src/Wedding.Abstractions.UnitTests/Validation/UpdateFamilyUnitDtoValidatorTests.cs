using FluentAssertions;
using FluentValidation.TestHelper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;

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
        public void Should_Have_Error_When_InvitationCode_Is_Invalid()
        {
            var familyUnit = new FamilyUnitDto
            {
                InvitationCode = "invalid_code",
                Tier = "Tier1",
                Guests = new List<GuestDto> { TestDataHelper.GUEST_JOHN }
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldHaveValidationErrorFor(f => f.InvitationCode);
        }

        [Test]
        public void Should_Have_Error_When_Guest_LastName_Is_Invalid()
        {
            var familyUnit = new FamilyUnitDto
            {
                InvitationCode = "ASFGH",
                Guests = new List<GuestDto> { new GuestDto
                {
                    GuestNumber = 1,
                    FirstName = "yay",
                    Roles = new List<RoleEnum> { RoleEnum.Guest }
                } }
            };

            var result = _validator.TestValidate(familyUnit);

            // foreach (var error in result.Errors)
            // {
            //     Console.WriteLine($"Property: {error.PropertyName}, Error: {error.ErrorMessage}");
            // }
            result.ShouldHaveValidationErrorFor("Guests[0].LastName");
            //result.ShouldHaveValidationErrorFor(f => f.Guests);
            //result.Errors.Any(e => e.PropertyName == "Guests[0].LastName").Should().BeTrue();
            //result.ShouldHaveValidationErrorFor(f => f.Guests![0]!.LastName);
        }

        [Test]
        public void Should_Have_Error_When_Guests_Is_Null()
        {
            var familyUnit = new FamilyUnitDto
            {
                InvitationCode = "valid_code",
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
                InvitationCode = "valid_code",
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
                InvitationCode = "valid_code",
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
                InvitationCode = "valid_code",
                Tier = "Tier1",
                Guests = new List<GuestDto> { TestDataHelper.GUEST_JOHN }
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldNotHaveValidationErrorFor(f => f.Guests);
        }

        [Test]
        public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
        {
            var familyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "C",
                Guests = new List<GuestDto> { 
                    new GuestDto
                    {
                        FirstName = "Bob",
                        LastName = "Licker",
                        GuestNumber = 1,
                        Roles = new List<RoleEnum> { RoleEnum.Guest }
                    }
                }
            };

            var result = _validator.TestValidate(familyUnit);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
