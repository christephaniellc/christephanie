using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminUpdateFamilyUnitCommandValidator))]
    public class AdminUpdateFamilyUnitCommandValidatorTests
    {
        private TestTokenHelper? _testTokenHelper;
        private AdminUpdateFamilyUnitCommandValidator? _validator;

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _validator = new AdminUpdateFamilyUnitCommandValidator();
        }

        [Test]
        public void Should_NotValidate_When_Self_NotAdmin()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminUpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(c => c.AuthContext);
        }

        [Test]
        public void Should_Validate_When_FamilyUnit_Is_Valid_And_Admin()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminUpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE, authContext);

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
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminUpdateFamilyUnitCommand(TestDataHelper.FAMILY_DOE, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(c => c.AuthContext);
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_Is_Null()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminUpdateFamilyUnitCommand(null!, authContext);

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
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var invalidFamilyUnit = new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "Tier1",
                Guests = new List<GuestDto>()
            };
            var command = new AdminUpdateFamilyUnitCommand(invalidFamilyUnit, authContext);

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
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var invalidFamilyUnit = new FamilyUnitDto
            {
                InvitationCode = "",
                Tier = "Tier1",
                Guests = new List<GuestDto>
                {
                    new GuestDto 
                    { 
                        FirstName = "Guest1", 
                        Email = new VerifiedDto { Value = "guest1@example.com" },
                        Roles = new List<RoleEnum> { RoleEnum.Guest }
                    }
                }
            };
            var command = new AdminUpdateFamilyUnitCommand(invalidFamilyUnit, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnit.InvitationCode");
        }

        [Test]
        public void Should_Have_Error_When_User_Not_Admin()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles),
                IpAddress = "127.0.0.1"
            };
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
                        Email = new VerifiedDto
                        {
                            Value = "guest1@example.com",
                        },
                        GuestNumber = 1,
                        Roles = new List<RoleEnum>
                        {
                            RoleEnum.Guest,
                        }
                    }
                }
            };
            var command = new AdminUpdateFamilyUnitCommand(validFamilyUnit, authContext);

            // Act & Assert
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("AuthContext");
        }
    }
}
