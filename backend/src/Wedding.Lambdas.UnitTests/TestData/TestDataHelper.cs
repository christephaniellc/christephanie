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
                    Roles = new List<RoleEnum> { RoleEnum.Guest },
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
                    EmailVerified = true
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
                    Tier = "A",
                    Guests = new List<GuestDto>
                    {
                        GUEST_JOHN,
                        GUEST_JANE
                    }
                };
            }
        }

        public static string REAL_JSON_FAMILY_UNIT = @"
{
    ""invitationCode"": ""RVMBL"",
    ""unitName"": ""Sikorra_Topher Family"",
    ""tier"": ""A+"",
    ""guests"": [
        {
            ""invitationCode"": ""RVMBL"",
            ""guestId"": ""6f2e238d-6792-453f-82d1-1cde35414d5b"",
            ""guestNumber"": 1,
            ""auth0Id"": ""placeholder-auth0-id"",
            ""firstName"": ""FirstNamePlaceholder"",
            ""additionalFirstNames"": [
                ""additionalNamePlaceholder1""
            ],
            ""lastName"": ""LastNamePlaceholder"",
            ""roles"": [
                5,
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
            ""invitationCode"": ""RVMBL"",
            ""guestId"": ""8e22da5e-2943-4297-bb78-1d60e82ba94c"",
            ""guestNumber"": 2,
            ""auth0Id"": ""placeholder-auth0-id-2"",
            ""firstName"": ""FirstNamePlaceholder2"",
            ""additionalFirstNames"": [
                ""additionalNamePlaceholder2""
            ],
            ""lastName"": ""LastNamePlaceholder2"",
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
