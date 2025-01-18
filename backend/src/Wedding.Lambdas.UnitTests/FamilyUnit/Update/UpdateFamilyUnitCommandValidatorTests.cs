using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Update.Commands;
using Wedding.Lambdas.FamilyUnit.Update.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(UpdateFamilyUnitCommandValidator))]
    public class UpdateFamilyUnitCommandValidatorTests
    {
        private UpdateFamilyUnitCommandValidator _validator;
        private TestTokenHelper _testTokenHelper;

        [SetUp]
        public void SetUp()
        {
            _validator = new UpdateFamilyUnitCommandValidator();
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
        }

        [Test]
        public void Should_Validate_When_FamilyUnit_Is_Valid_And_Self()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles)
            };
            var command = new UpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Validate_When_FamilyUnit_Is_Valid_And_Admin()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles)
            };
            var command = new UpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_NotValidate_When_FamilyUnit_Is_Valid_And_User_Has_No_Permission()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                GuestId = Guid.NewGuid().ToString(),
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles)
            };
            var command = new UpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(c => c);
        }

        [Test]
        public void Should_NotValidate_When_FamilyUnit_Is_Valid_And_User_Not_In_Family()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = "BADCO",
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles)
            };
            var command = new UpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(c => c);
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_Is_Null()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = "BADCO",
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles)
            };
            var command = new UpdateFamilyUnitCommand(null, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(c => c.FamilyUnit)
                .WithErrorMessage("'Family Unit' must not be empty.");
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_Guests_Are_Empty()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles)
            };
            var invalidFamilyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "Tier1",
                Guests = new List<GuestDto>()
            };
            var command = new UpdateFamilyUnitCommand(invalidFamilyUnit, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnit.Guests")
                .WithErrorMessage("Must include at least one guest");
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Invalid()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles)
            };
            var invalidFamilyUnit = new FamilyUnitDto
            {
                InvitationCode = "",
                Tier = "Tier1",
                Guests = new List<GuestDto>
                {
                    new GuestDto { FirstName = "Guest1", Email = "guest1@example.com" }
                }
            };
            var command = new UpdateFamilyUnitCommand(invalidFamilyUnit, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnit.InvitationCode");
        }
    }
}
