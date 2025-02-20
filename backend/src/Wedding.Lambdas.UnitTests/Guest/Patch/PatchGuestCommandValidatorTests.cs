using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Guest.Patch.Commands;
using Wedding.Lambdas.Guest.Patch.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Guest.Patch
{
    [TestFixture]
    [UnitTestsFor(typeof(PatchGuestCommandValidator))]
    public class PatchGuestCommandValidatorTests
    {
        private PatchGuestCommandValidator? Sut;
        private TestTokenHelper? _testTokenHelper;
        private AuthContext? _fakeAuthContext;

        [SetUp]
        public void SetUp()
        {
            Sut = new PatchGuestCommandValidator();
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _fakeAuthContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles),
                IpAddress = "127.0.0.1"
            };
        }

        [Test]
        public void Should_Validate_When_Email_Is_Valid()
        {
            // Arrange
            var command = new PatchGuestCommand(_fakeAuthContext!, TestDataHelper.GUEST_JOHN.GuestId, Email: "newemail@gmail.com");

            // Act & Assert
            var result = Sut.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_NotValidate_When_Email_Is_Invalid()
        {
            // Arrange
            var command = new PatchGuestCommand(_fakeAuthContext!, TestDataHelper.GUEST_JOHN.GuestId, Email: "a..@gmail.com");

            // Act & Assert
            var result = Sut.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Test]
        public void Should_Validate_When_Phone_Is_Valid()
        {
            // Arrange
            var command = new PatchGuestCommand(_fakeAuthContext!, TestDataHelper.GUEST_JOHN.GuestId, Phone: "202-555-5555");

            // Act & Assert
            var result = Sut.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_NotValidate_When_Phone_Is_Invalid()
        {
            // Arrange
            var command = new PatchGuestCommand(_fakeAuthContext!, TestDataHelper.GUEST_JOHN.GuestId, Phone: "000");

            // Act & Assert
            var result = Sut.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.Phone);
        }
    }
}
