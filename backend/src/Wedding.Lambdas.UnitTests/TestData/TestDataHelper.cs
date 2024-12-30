using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;

namespace Wedding.Lambdas.UnitTests.TestData
{
    public static class TestDataHelper
    {
        public static string TEST_INVITATION_CODE
        {
            get
            {
                return "ABAAB";
            }
        }

        public static GuestDto GUEST_JOHN
        {
            get
            {
                return new GuestDto
                {
                    InvitationCode = TEST_INVITATION_CODE,
                    GuestId = new Guid("73340000-0000-0000-0000-000000000001").ToString(),
                    GuestNumber = 1,
                    FirstName = "John",
                    AdditionalFirstNames = new List<string> { "Jacob" },
                    LastName = "Smith",
                    Roles = new List<RoleEnum> { RoleEnum.Guest
                    },
                    EmailVerified = false
                };
            }
        }

        public static GuestDto GUEST_JANE
        {
            get
            {
                return new GuestDto
                {
                    InvitationCode = TEST_INVITATION_CODE,
                    GuestId = new Guid("73340000-0000-0000-0000-000000000002").ToString(),
                    GuestNumber = 2,
                    FirstName = "Jane",
                    LastName = "Smith",
                    Roles = new List<RoleEnum> { RoleEnum.Guest, RoleEnum.Party },
                    EmailVerified = false
                };
            }
        }

        public static FamilyUnitDto FAMILY_DOE
        {
            get
            {
                return new FamilyUnitDto
                {
                    InvitationCode = TEST_INVITATION_CODE,
                    UnitName = "Smiths",
                    Guests = new List<GuestDto>
                    {
                        GUEST_JOHN,
                        GUEST_JANE
                    }
                };
            }
        }
    }
}
