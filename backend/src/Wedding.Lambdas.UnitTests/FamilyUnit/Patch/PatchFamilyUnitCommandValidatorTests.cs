using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Patch.Commands;
using Wedding.Lambdas.FamilyUnit.Patch.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Patch
{
    [TestFixture]
    [UnitTestsFor(typeof(PatchFamilyUnitCommandValidator))]
    public class PatchFamilyUnitCommandValidatorTests
    {
        private PatchFamilyUnitCommandValidator? Sut;
        private TestTokenHelper? _testTokenHelper;

        [SetUp]
        public void SetUp()
        {
            Sut = new PatchFamilyUnitCommandValidator();
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
        }

        [Test]
        public void Should_Validate_When_Address_And_Notes_Are_Valid()
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
            var addressDto = new AddressDto
            {
                StreetAddress = "564 Test St.",
                City = "Anytown",
                State = "DC",
                ZIPCode = "12345"
            };

            var command = new PatchFamilyUnitCommand(authContext, addressDto, "new notes");

            // Act & Assert
            var result = Sut.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Validate_When_Notes_Are_Valid()
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

            var command = new PatchFamilyUnitCommand(authContext, null, "new notes");

            // Act & Assert
            var result = Sut.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
