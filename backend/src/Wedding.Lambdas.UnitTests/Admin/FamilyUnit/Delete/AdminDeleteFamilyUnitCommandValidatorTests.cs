using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Delete
{
    [UnitTestsFor(typeof(AdminDeleteFamilyUnitCommandValidator))]
    [TestFixture]
    public class AdminDeleteFamilyUnitCommandValidatorTests
    {
        private TestTokenHelper _testTokenHelper;
        private AdminDeleteFamilyUnitCommandValidator _validator;

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _validator = new AdminDeleteFamilyUnitCommandValidator();
        }

        [Test]
        public void Validate_ValidInvitationCode_ShouldNotHaveValidationError()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles)
            };
            var command = new AdminDeleteFamilyUnitCommand("ABCDE", authContext);

            // Act
            var result = _validator.TestValidate(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(cmd => cmd.InvitationCode);
        }

        [Test]
        public void Validate_InvalidInvitationCode_ShouldHaveValidationError()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles)
            };
            var command = new AdminDeleteFamilyUnitCommand("INVALID!CODE", authContext);

            // Act
            var result = _validator.TestValidate(command);

            // Assert
            result.ShouldHaveValidationErrorFor(cmd => cmd.InvitationCode);
        }

        [Test]
        public void Validate_NullInvitationCode_ShouldHaveValidationError()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles)
            };
            var command = new AdminDeleteFamilyUnitCommand(null, authContext);

            // Act
            var result = _validator.TestValidate(command);

            // Assert
            result.ShouldHaveValidationErrorFor(cmd => cmd.InvitationCode);
        }

        [Test]
        public void IsValid_ThrowsException_WhenCommandIsInvalid()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles)
            };
            var command = new AdminDeleteFamilyUnitCommand("INVALID!CODE", authContext);

            // Act & Assert
            Assert.Throws<FluentValidation.ValidationException>(() => _validator.IsValid(command));
        }

        [Test]
        public void IsValid_DoesNotThrowException_WhenCommandIsValid()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles)
            };
            var command = new AdminDeleteFamilyUnitCommand("ABCDE", authContext);

            // Act & Assert
            Assert.DoesNotThrow(() => _validator.IsValid(command));
        }
        
        [Test]
        public void IsValid_ThrowsException_WhenCommandIsValid_ButNotAdmin()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles)
            };
            var command = new AdminDeleteFamilyUnitCommand("ABCDE", authContext);

            // Act
            var result = _validator.TestValidate(command);

            // Assert
            result.ShouldHaveValidationErrorFor(cmd => cmd.AuthContext);
        }
    }
}
