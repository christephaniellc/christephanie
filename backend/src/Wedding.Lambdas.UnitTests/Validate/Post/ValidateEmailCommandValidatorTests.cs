using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Lambdas.Validate.Email.Commands;
using Wedding.Lambdas.Validate.Email.Validation;

namespace Wedding.Lambdas.UnitTests.Validate.Post
{
    public class ValidateEmailCommandValidatorTests
    {
        private TestTokenHelper? _testTokenHelper;
        private ValidateEmailCommandValidator? Sut;
        private AuthContext? _fakeAuthContext;

        [SetUp]
        public void SetUp()
        {
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

            Sut = new ValidateEmailCommandValidator();
        }

        [Test]
        public void Should_Not_Have_Error_When_Code_IsValid()
        {
            var command = new ValidateEmailCommand(AuthContext: _fakeAuthContext, Code: "123456");

            var result = Sut.TestValidate(command);

            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Have_Error_When_Code_IsWrongLength()
        {
            var command = new ValidateEmailCommand(AuthContext: _fakeAuthContext, Code: "1234567");

            var result = Sut.TestValidate(command);

            result.ShouldHaveValidationErrorFor(x => x.Code);
        }

        [Test]
        public void Should_Have_Error_When_Code_HasBadChars()
        {
            var command = new ValidateEmailCommand(AuthContext: _fakeAuthContext, Code: "12345*");

            var result = Sut.TestValidate(command);

            result.ShouldHaveValidationErrorFor(x => x.Code);
        }
    }
}
