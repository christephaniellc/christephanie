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
        public static string TEST_INVITATION_CODE_NEW
        {
            get
            {
                return "MMMMM";
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
                    Roles = new List<RoleEnum> { RoleEnum.Guest },
                    Email = new VerifiedDto
                    {
                        Value = "john.doe@gmail.com",
                        Verified = false,
                        VerificationCode = null,
                        VerificationCodeExpiration = null
                    },
                    Phone = new VerifiedDto
                    {
                        Value = "555-555-5555",
                        Verified = false,
                        VerificationCode = null,
                        VerificationCodeExpiration = null
                    },
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
                    Email = new VerifiedDto
                    {
                        Value = "jane.doe@gmail.com",
                        Verified = false,
                        VerificationCode = null,
                        VerificationCodeExpiration = null
                    },
                    Phone = new VerifiedDto
                    {
                        Value = "555-555-5555",
                        Verified = false,
                        VerificationCode = null,
                        VerificationCodeExpiration = null
                    },
                };
            }
        }

        public static GuestDto GUEST_ADMIN
        {
            get
            {
                return new GuestDto
                {
                    InvitationCode = "NMBCD",
                    GuestId = new Guid("73340000-0000-0000-0000-000000000003").ToString(),
                    GuestNumber = 2,
                    FirstName = "Admin",
                    LastName = "Dude",
                    Roles = new List<RoleEnum> { RoleEnum.Guest, RoleEnum.Admin },
                    Email = new VerifiedDto
                    {
                        Value = "admin.doe@gmail.com",
                        Verified = true,
                        VerificationCode = null,
                        VerificationCodeExpiration = null
                    },
                    Phone = new VerifiedDto
                    {
                        Value = "555-555-5555",
                        Verified = false,
                        VerificationCode = null,
                        VerificationCodeExpiration = null
                    },
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
                    Tier = "Platinum",
                    Guests = new List<GuestDto>
                    {
                        GUEST_JOHN,
                        GUEST_JANE
                    },
                    MailingAddress = new AddressDto
                    {
                        StreetAddress = "123 Main St.",
                        City = "New York",
                        State = "NY"
                    }
                };
            }
        }

        public static string REAL_JSON_FAMILY_UNIT = @"
{
    ""invitationCode"": ""ABAAB"",
    ""unitName"": ""The Doe Family"",
    ""tier"": ""A+"",
    ""guests"": [
        {
            ""invitationCode"": ""ABAAB"",
            ""guestId"": ""73340000-0000-0000-0000-000000000001"",
            ""guestNumber"": 1,
            ""auth0Id"": ""placeholder-auth0-id"",
            ""firstName"": ""John"",
            ""additionalFirstNames"": [
                ""additionalNamePlaceholder1""
            ],
            ""lastName"": ""Doe"",
            ""roles"": [
                3,
                2
            ],
            ""email"": ""email-placeholder@gmail.com"",
            ""emailVerified"": true,
            ""phone"": ""phone-placeholder"",
            ""rsvp"": {
                ""invitationResponse"": 0
            },
            ""preferences"": {
                ""guestId"": """"
            },
            ""ageGroup"": 0,
            ""guestLogins"": [
                ""2025-01-01T16:49:43.841+00:00""
            ]
        },
        {
            ""invitationCode"": ""ABAAB"",
            ""guestId"": ""73340000-0000-0000-0000-000000000002"",
            ""guestNumber"": 2,
            ""auth0Id"": ""placeholder-auth0-id-2"",
            ""firstName"": ""Jane"",
            ""additionalFirstNames"": [
                ""additionalNamePlaceholder2""
            ],
            ""lastName"": ""Doe"",
            ""roles"": [
                5,
                3,
                2
            ],
            ""email"": ""email-placeholder2@gmail.com"",
            ""emailVerified"": true,
            ""phone"": ""phone-placeholder2"",
            ""rsvp"": {
                ""invitationResponse"": 0
            },
            ""preferences"": {
                ""guestId"": """"
            },
            ""ageGroup"": 0,
            ""guestLogins"": [
                ""2025-01-01T06:41:09.603+00:00""
            ]
        }
    ],
    ""additionalAddresses"": [],
    ""potentialHeadCount"": 2,
    ""familyUnitLastLogin"": ""2025-01-01T18:16:15.828+00:00""
}";
    }
}
