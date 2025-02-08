using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Validation;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Create
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminCreateFamilyUnitsCommandValidator))]
    public class AdminCreateFamilyUnitsCommandValidatorTests
    {
        private TestTokenHelper? _testTokenHelper;
        private AdminCreateFamilyUnitsCommandValidator? _validator;

        private static readonly GuestDto VALID_GUEST = new GuestDto
        {
            FirstName = "John",
            LastName = "Doe",
            Email = new VerifiedDto
            {
                Value = ""
            },
            Roles = new List<RoleEnum> { RoleEnum.Guest }
        };

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
            .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
            _validator = new AdminCreateFamilyUnitsCommandValidator();
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnits_Are_Null()
        {
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminCreateFamilyUnitsCommand(null!, authContext);
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.FamilyUnits);
        }

        [Test]
        public void Should_Have_Error_When_FamilyUnit_InvitationCode_Is_Empty()
        {
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                    new FamilyUnitDto
                    {
                        InvitationCode = string.Empty
                    }},
                authContext
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnits[0].InvitationCode");
        }

        [Test]
        public void Should_Have_Error_When_InvitationCode_Is_NotValid()
        {
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                    new FamilyUnitDto
                    {
                        InvitationCode = "sldkfsdfsdfj"
                    }},
                authContext
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnits[0].InvitationCode");
        }

        [Test]
        public void Should_Have_Error_When_Tier_Is_NotValid()
        {
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "123"
                }},
                authContext
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnits[0].Tier");
        }

        [Test]
        public void Should_Have_Error_When_No_Guests()
        {
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE"
                }},
                authContext
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor("FamilyUnits[0].Guests");
        }

        [Test]
        public void Should_Not_Have_Error_When_Command_Is_Valid()
        {
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_ADMIN.InvitationCode,
                GuestId = TestDataHelper.GUEST_ADMIN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_ADMIN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> {
                new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "B",
                    Guests = new List<GuestDto> { VALID_GUEST }
                }},
                authContext
            );
            var result = _validator.TestValidate(command);
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Test]
        public void Should_Have_Error_When_Not_Admin()
        {
            var authContext = new AuthContext
            {
                Audience = _testTokenHelper!.JwtAudience,
                InvitationCode = TestDataHelper.GUEST_JOHN.InvitationCode,
                GuestId = TestDataHelper.GUEST_JOHN.GuestId,
                Roles = string.Join(',', TestDataHelper.GUEST_JOHN.Roles),
                IpAddress = "127.0.0.1"
            };
            var command = new AdminCreateFamilyUnitsCommand(
                new List<FamilyUnitDto> { new FamilyUnitDto
                {
                    InvitationCode = "ABCDE",
                    Tier = "B",
                    Guests = new List<GuestDto> { VALID_GUEST }
                }},
                authContext
            );
            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(x => x.AuthContext);
        }
    }
}
