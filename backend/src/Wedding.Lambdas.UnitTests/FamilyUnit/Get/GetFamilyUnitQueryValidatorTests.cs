using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Get.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(GetFamilyUnitQueryValidator))]
    public class GetFamilyUnitQueryValidatorTests
    {
        private TestTokenHelper _testTokenHelper;
        private GetFamilyUnitQueryValidator _validator;

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _validator = new GetFamilyUnitQueryValidator();
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_Empty()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = "",
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = TestDataHelper.GUEST_ADMIN.Roles.ToString()
            };
            var query = new GetFamilyUnitQuery(authContext);

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.AuthContext.InvitationCode);
        }

        [Test]
        public void Should_Not_Have_Error_When_InvitationCode_Is_Invalid()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = "sdfsdfsdfsd",
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = TestDataHelper.GUEST_ADMIN.Roles.ToString()
            };
            var query = new GetFamilyUnitQuery(authContext);

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.AuthContext.InvitationCode);
        }

        [Test]
        public void Should_Have_Error_When_GuestId_Is_Empty()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = "",
                Roles = TestDataHelper.GUEST_ADMIN.Roles.ToString()
            };
            var query = new GetFamilyUnitQuery(authContext);

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.AuthContext.GuestId);
        }

        [Test]
        public void Should_Not_Have_Error_When_GuestId_Is_Invalid()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = "sdfsdfsdfsd",
                Roles = TestDataHelper.GUEST_ADMIN.Roles.ToString()
            };
            var query = new GetFamilyUnitQuery(authContext);

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.AuthContext.GuestId);
        }

        [Test]
        public void Should_Not_Have_Error_When_InvitationCode_Has_Invalid_Chars()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = "324oijsoifj",
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = TestDataHelper.GUEST_ADMIN.Roles.ToString()
            };
            var query = new GetFamilyUnitQuery(authContext);

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldHaveValidationErrorFor(q => q.AuthContext.InvitationCode);
        }

        [Test]
        public void Should_Not_Have_Error_When_InvitationCode_Is_Valid()
        {
            // Arrange
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = TestDataHelper.GUEST_ADMIN.Roles.ToString()
            };
            var query = new GetFamilyUnitQuery(authContext);

            // Act & Assert
            var result = _validator.TestValidate(query);
            result.ShouldNotHaveValidationErrorFor(q => q.AuthContext.InvitationCode);
            result.ShouldNotHaveValidationErrorFor(q => q.AuthContext.GuestId);
            result.ShouldNotHaveValidationErrorFor(q => q.AuthContext.Roles);
        }
    }
}
