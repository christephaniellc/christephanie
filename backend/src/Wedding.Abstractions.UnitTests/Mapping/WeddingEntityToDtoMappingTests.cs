using System.Text.Json;
using AutoMapper;
using FluentAssertions;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.ClientInfo;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Mapping
{
    [TestFixture]
    [UnitTestsFor(typeof(WeddingEntityToDtoMapping))]
    public class WeddingEntityToDtoMappingTests
    {
        private IMapper _mapper;
        private string _invitationCode = "ABCDE";

        [SetUp]
        public void SetUp()
        {
            var config = new MapperConfiguration(cfg =>
                {
                    cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                    cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                    cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
                    cfg.AllowNullCollections = true;
                }
            );
            _mapper = config.CreateMapper();
        }

        [Test]
        public void ShouldInitializeNestedPropertiesIfNull()
        {
            var guestId = Guid.NewGuid().ToString();
            var entity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_invitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(guestId),
                InvitationCode = _invitationCode,
                GuestId = guestId
            };

            var dto = _mapper.Map<GuestDto>(entity);

            dto.Rsvp.Should().NotBeNull();
            dto.Preferences.Should().NotBeNull();
        }

        [Test]
        public void ShouldHandleNullMailingAddressGracefully()
        {
            var entity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_invitationCode),
                SortKey = DynamoKeys.GetFamilyInfoSortKey(),
                InvitationCode = _invitationCode,
                UnitName = "Doe Family",
                MailingAddress = null, // Simulating null value
                AdditionalAddresses = null
            };

            var result = _mapper.Map<FamilyUnitDto>(entity);
            Assert.IsNull(result.MailingAddress);
            Assert.IsNull(result.AdditionalAddresses);
        }

        [Test]
        public void Should_Map_WeddingEntity_To_FamilyUnitDto()
        {
            var address = new AddressDto
            {
                StreetAddress = "123 Main St.",
                City = "Seattle",
                State = "WA",
                UspsVerified = true
            };
            var address2 = new AddressDto
            {
                StreetAddress = "456 Elm St",
                City = "Washington",
                State = "DC"
            };
            var entity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_invitationCode),
                SortKey = DynamoKeys.GetFamilyInfoSortKey(),
                InvitationCode = _invitationCode,
                UnitName = "Smith Family",
                Tier = "A",
                InvitationResponseNotes = "Looking forward to it!",
                MailingAddress = address.ToString(),
                AdditionalAddresses = new List<string>
                {
                    address2.ToString()
                },
                PotentialHeadCount = 5,
                FamilyUnitLastLogin = DateTime.Now
            };

            var dto = _mapper.Map<FamilyUnitDto>(entity);

            dto.InvitationCode.Should().Be(entity.InvitationCode);
            dto.UnitName.Should().Be(entity.UnitName);
            dto.Tier.Should().Be(entity.Tier);
            dto.InvitationResponseNotes.Should().Be(entity.InvitationResponseNotes);
            dto.MailingAddress.Should().BeEquivalentTo(address);
            dto.MailingAddress.Should().NotBeNull();
            dto.MailingAddress!.UspsVerified.Should().BeTrue();
            dto.AdditionalAddresses.Should().NotBeNull();
            dto.AdditionalAddresses![0].Should().BeEquivalentTo(address2);
            dto.AdditionalAddresses[0].UspsVerified.Should().BeFalse();
            dto.PotentialHeadCount.Should().Be(entity.PotentialHeadCount);
            dto.FamilyUnitLastLogin.Should().Be(entity.FamilyUnitLastLogin);
            dto.Guests.Should().BeNull();
        }

        [Test]
        public void Should_Map_WeddingEntity_To_GuestDto()
        {
            var email = "john.doe@example.com";
            var phone = "123-456-7890";
            var guestId = Guid.NewGuid().ToString();

            var entity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_invitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(guestId),
                InvitationCode = _invitationCode,
                GuestId = guestId,
                Auth0Id = "auth0|123456",
                FirstName = "Jon",
                AdditionalFirstNames = new List<string> { "Jonathan", "Jojo"},
                LastName = "Doe",
                Roles = new List<RoleEnum> { RoleEnum.Admin },
                Email = new VerifiedDto { Value = email }.ToString(),
                Phone = new VerifiedDto { Value = phone }.ToString(),
                AgeGroup = AgeGroupEnum.Adult,
                InvitationResponseNotes = "Can't wait!",
                LastActivity = System.DateTime.Now
            };

            var dto = _mapper.Map<GuestDto>(entity);

            dto.GuestId.Should().Be(entity.GuestId);
            dto.Auth0Id.Should().Be(entity.Auth0Id);
            dto.FirstName.Should().Be(entity.FirstName);
            dto.AdditionalFirstNames.Should().BeEquivalentTo(entity.AdditionalFirstNames);
            dto.LastName.Should().Be(entity.LastName);
            dto.Roles.Should().BeEquivalentTo(entity.Roles);
            dto.Email.Should().NotBeNull();
            dto.Email!.Value.Should().Be(email);
            dto.Phone!.Value.Should().Be(phone);
            dto.AgeGroup.Should().Be(entity.AgeGroup);
            dto.LastActivity.Should().Be(entity.LastActivity);
            dto.Rsvp.Should().NotBeNull();
            dto.Rsvp!.InvitationResponse.Should().Be(entity.InvitationResponse);
            EmptyObjectHelper.ObjectPropertiesAreNullOrEmpty(dto.Preferences!).Should().BeTrue();
        }

        [Test]
        public void Should_Map_WeddingEntityJson_To_GuestDto()
        {
            var filePath = @"..\..\..\..\Wedding.Common.Utility.Testing\TestDataJsons\GuestDto.json";
            var entityJson = File.ReadAllText(filePath);
            var entity = JsonSerializer.Deserialize<WeddingEntity>(entityJson);

            var dto = _mapper.Map<GuestDto>(entity);

            entity.Should().NotBeNull();
            dto.GuestId.Should().Be(entity!.GuestId);
            dto.Auth0Id.Should().Be(entity.Auth0Id);
            dto.FirstName.Should().Be(entity.FirstName);
            dto.AdditionalFirstNames.Should().BeEquivalentTo(entity.AdditionalFirstNames);
            dto.LastName.Should().Be(entity.LastName);
            dto.Roles.Should().BeEquivalentTo(entity.Roles);
            dto.Email!.Value.Should().Be("john.doe@gmail.com");
            dto.Phone!.Value.Should().Be("202-555-5555");
            dto.AgeGroup.Should().Be(entity.AgeGroup);
            dto.LastActivity.Should().Be(entity.LastActivity);
            dto.Rsvp.Should().NotBeNull();
            dto.Rsvp!.InvitationResponse.Should().Be(entity.InvitationResponse);
            EmptyObjectHelper.ObjectPropertiesAreNullOrEmpty(dto.Preferences!).Should().BeTrue();
        }

        [Test]
        public void Should_Map_WeddingEntity_To_RsvpDto()
        {
            var guestId = Guid.NewGuid().ToString();
            var audit = new LastUpdateAuditDto
            {
                LastUpdate = DateTime.UtcNow,
                Username = "me"
            };
            var entity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_invitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(guestId),
                InvitationCode = _invitationCode,
                GuestId = guestId,
                InvitationResponse = InvitationResponseEnum.Pending,
                RsvpWedding = RsvpEnum.Attending,
                PrefSleep = SleepPreferenceEnum.Camping,
                RsvpRehearsalDinner = null,
                RsvpFourthOfJuly = RsvpEnum.Attending,
                RsvpAudit = audit.ToString()
            };

            var dto = _mapper.Map<RsvpDto>(entity);

            dto.InvitationResponse.Should().Be(entity.InvitationResponse);
            dto.Wedding.Should().Be(entity.RsvpWedding);
            dto.RehearsalDinner.Should().Be(entity.RsvpRehearsalDinner);
            dto.FourthOfJuly.Should().Be(entity.RsvpFourthOfJuly);
            dto.RsvpAudit.Should().NotBeNull();
            dto.RsvpAudit!.LastUpdate.Should().Be(audit.LastUpdate);
            dto.RsvpAudit.Username.Should().Be(audit.Username);
        }

        [Test]
        public void Should_Map_WeddingEntity_To_PreferencesDto()
        {
            var guestId = Guid.NewGuid().ToString();
            var entity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_invitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(guestId),
                InvitationCode = _invitationCode,
                GuestId = guestId,
                PrefSleep = SleepPreferenceEnum.Camping,
                PrefFood = FoodPreferenceEnum.Omnivore,
                PrefFoodAllergies = new List<string> {"Peanuts"},
            };

            var dto = _mapper.Map<PreferencesDto>(entity);

            dto.SleepPreference.Should().Be(entity.PrefSleep);
            dto.FoodPreference.Should().Be(entity.PrefFood);
            dto.FoodAllergies.Should().BeEquivalentTo(entity.PrefFoodAllergies);
        }

        [Test]
        public void Should_Map_FamilyUnitDto_To_WeddingEntity()
        {
            // Arrange
            var dto = new FamilyUnitDto
            {
                InvitationCode = "RSVP123",
                UnitName = "Smith Family",
                Tier = "Gold",
                InvitationResponseNotes = "Looking forward to it!",
                MailingAddress = new AddressDto { StreetAddress = "123 Main St"},
                AdditionalAddresses = new List<AddressDto> { new AddressDto { StreetAddress = "456 Elm St" }},
                Guests = new List<GuestDto>
                {
                    new GuestDto
                    {
                        GuestId = Guid.NewGuid().ToString(),
                        GuestNumber = 1,
                        FirstName = "John",
                        LastName = "Jingleheimer",
                        Email = new VerifiedDto { Value = "jingleheimersmith@gmai.com" },
                        Phone = new VerifiedDto { Value = "123-456-7890" },
                        AgeGroup = AgeGroupEnum.Under13,
                        Roles = new List<RoleEnum> { RoleEnum.Staff },
                        Rsvp = new RsvpDto
                        {
                            InvitationResponse = InvitationResponseEnum.Interested,
                            Wedding = RsvpEnum.Attending
                        },
                        LastActivity = System.DateTime.Now,
                    },
                    new GuestDto
                    {
                        GuestId = Guid.NewGuid().ToString(),
                        Roles = new List<RoleEnum> { RoleEnum.Guest }
                    }
                },
                FamilyUnitLastLogin = System.DateTime.Now
            };

            // Act
            var entity = _mapper.Map<WeddingEntity>(dto);

            // Assert
            entity.InvitationCode.Should().Be(dto.InvitationCode);
            entity.UnitName.Should().Be(dto.UnitName);
            entity.Tier.Should().Be(dto.Tier);
            entity.InvitationResponseNotes.Should().Be(dto.InvitationResponseNotes);
            entity.MailingAddress.Should().Be(dto.MailingAddress.ToString());
            entity.AdditionalAddresses.Should().NotBeNull();
            entity.AdditionalAddresses![0].Should().BeEquivalentTo(dto.AdditionalAddresses[0].ToString());
            entity.PotentialHeadCount.Should().Be(dto.Guests.Count);
            entity.PrefFood.Should().BeNull();
            entity.FamilyUnitLastLogin.Should().Be(dto.FamilyUnitLastLogin);
        }

        [Test]
        public void Should_Map_WeddingEntity_To_GuestDto_WithPrefs()
        {
            var guestId = Guid.NewGuid().ToString();
            var email = "john.doe@example.com";
            var phone = "123-456-7890";

            var entity = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(_invitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(guestId),
                InvitationCode = _invitationCode,
                GuestId = guestId,
                GuestNumber = 1,
                Auth0Id = "auth0|test",
                FirstName = "John",
                LastName = "Doe",
                Roles = new List<RoleEnum> { RoleEnum.Guest },
                Email = new VerifiedDto { Value = email }.ToString(),
                Phone = new VerifiedDto { Value = phone }.ToString(),
                AgeGroup = AgeGroupEnum.Adult,
                LastActivity =  System.DateTime.Now,
                InvitationResponse = InvitationResponseEnum.Interested,
                RsvpWedding = RsvpEnum.Attending,
                PrefFood = FoodPreferenceEnum.Vegan,
            };

            var dto = _mapper.Map<GuestDto>(entity);

            dto.GuestId.Should().Be(entity.GuestId);
            dto.GuestNumber.Should().Be(entity.GuestNumber);
            dto.FirstName.Should().Be(entity.FirstName);
            dto.LastName.Should().Be(entity.LastName);
            dto.Email!.Value.Should().Be(email);
            dto.Phone!.Value.Should().Be(phone);
            dto.AgeGroup.Should().Be(entity.AgeGroup);
            dto.Rsvp.Should().NotBeNull();
            dto.Rsvp!.InvitationResponse.Should().Be(entity.InvitationResponse);
            dto.Rsvp.Wedding.Should().Be(entity.RsvpWedding);
            dto.Preferences.Should().NotBeNull();
            dto.Preferences!.FoodPreference.Should().Be(entity.PrefFood);
        }

        [Test]
        public void Should_Map_VerifyDto_False()
        {
            var verify = new VerifiedDto
            {
                Verified = false,
                VerificationCode = "123456",
                VerificationCodeExpiration = DateTime.UtcNow.AddMinutes(10)
            };
            
            var result = _mapper.Map<VerifiedDto>(verify.ToString());

            result.Verified.Should().Be(verify.Verified);
            result.VerificationCode.Should().Be(verify.VerificationCode);
            result.VerificationCodeExpiration.Should().Be(verify.VerificationCodeExpiration);
        }

        [Test]
        public void Should_Map_VerifyDto_True()
        {
            var verify = new VerifiedDto
            {
                Verified = true,
                VerificationCode = null,
                VerificationCodeExpiration = null
            };

            var result = _mapper.Map<VerifiedDto>(verify.ToString());

            result.Verified.Should().Be(verify.Verified);
            result.VerificationCode.Should().Be(verify.VerificationCode);
            result.VerificationCodeExpiration.Should().Be(verify.VerificationCodeExpiration);
        }

        [Test]
        public void Should_Map_GuestDto_To_WeddingEntity()
        {
            // Arrange
            var email = "jingleheimersmith@gmail.com";
            var phone = "123-456-7890";

            var guestDto = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 1,
                FirstName = "John",
                LastName = "Jingleheimer",
                Email = new VerifiedDto
                {
                    Value = email,
                    Verified = false,
                    VerificationCode = "123456",
                    VerificationCodeExpiration = DateTime.UtcNow.AddMinutes(10)
                },
                Phone = new VerifiedDto
                {
                    Value = phone,
                    Verified = true,
                    VerificationCode = null,
                    VerificationCodeExpiration = null
                },
                AgeGroup = AgeGroupEnum.Under13,
                Roles = new List<RoleEnum> { RoleEnum.Staff },
                Rsvp = new RsvpDto
                {
                    InvitationResponse = InvitationResponseEnum.Interested,
                    Wedding = RsvpEnum.Attending,
                },
                Preferences = new PreferencesDto
                {
                    NotificationPreference = new List<NotificationPreferenceEnum> { NotificationPreferenceEnum.Email },
                    SleepPreference = SleepPreferenceEnum.Camping,
                    FoodPreference = FoodPreferenceEnum.Omnivore,
                    FoodAllergies = new List<string> { "Peanuts" },
                },
                LastActivity = System.DateTime.Now,
            };

            // Act
            var entity = _mapper.Map<WeddingEntity>(guestDto);

            // Assert
            entity.GuestId.Should().Be(guestDto.GuestId);
            entity.GuestNumber.Should().Be(guestDto.GuestNumber);
            entity.Auth0Id.Should().Be(guestDto.Auth0Id);
            entity.FirstName.Should().Be(guestDto.FirstName);
            entity.LastName.Should().Be(guestDto.LastName);
            entity.AgeGroup.Should().Be(guestDto.AgeGroup);
            entity.Roles.Should().BeEquivalentTo(guestDto.Roles);
            entity.Email.Should().Be(guestDto.Email.ToString());
            entity.Phone.Should().Be(guestDto.Phone.ToString());
            entity.LastActivity.Should().Be(guestDto.LastActivity);

            entity.InvitationResponse.Should().Be(guestDto.Rsvp.InvitationResponse);
            entity.RsvpWedding.Should().Be(guestDto.Rsvp.Wedding);
            entity.RsvpRehearsalDinner.Should().Be(guestDto.Rsvp.RehearsalDinner);
            entity.RsvpFourthOfJuly.Should().Be(guestDto.Rsvp.FourthOfJuly);
            entity.RsvpNotes.Should().Be(guestDto.Rsvp.RsvpNotes);

            entity.PrefNotification.Should().BeEquivalentTo(guestDto.Preferences.NotificationPreference);
            entity.PrefSleep.Should().Be(guestDto.Preferences.SleepPreference);
            entity.PrefFood.Should().Be(guestDto.Preferences.FoodPreference);
            entity.PrefFoodAllergies.Should().BeEquivalentTo(guestDto.Preferences.FoodAllergies);
        }

        [Test]
        public void ClientInfoDto_To_String_Should_Serialize_Properly()
        {
            // Arrange
            var dto = new ClientInfoDto
            {
                DateRecorded = new DateTime(2025, 3, 12, 12, 0, 0, DateTimeKind.Utc),
                IpAddress = "192.168.1.1",
                Os = "Windows",
                Language = "en-US",
                TimeZone = "America/New_York",
                Referrer = "https://www.example.com"
                // You can add more properties if needed.
            };

            // Act
            var json = _mapper.Map<string?>(dto);

            // Assert
            json.Should().NotBeNull();
            json.Should().Contain("192.168.1.1");
            json.Should().Contain("Windows");
        }

        [Test]
        public void String_To_ClientInfoDto_Should_Deserialize_Properly()
        {
            // Arrange
            var dto = new ClientInfoDto
            {
                DateRecorded = new DateTime(2025, 3, 12, 12, 0, 0, DateTimeKind.Utc),
                IpAddress = "192.168.1.1",
                Os = "Windows",
                Language = "en-US",
                TimeZone = "America/New_York",
                Referrer = "https://www.example.com"
            };

            var json = JsonSerializer.Serialize(dto, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true
            });

            // Act
            var mappedDto = _mapper.Map<ClientInfoDto>(json);

            // Assert
            mappedDto.Should().NotBeNull();
            mappedDto.IpAddress.Should().Be("192.168.1.1");
            mappedDto.Os.Should().Be("Windows");
            mappedDto.Language.Should().Be("en-US");
            mappedDto.TimeZone.Should().Be("America/New_York");
            mappedDto.Referrer.Should().Be("https://www.example.com");
        }

        [Test]
        public void List_ClientInfoDto_To_List_String_Should_Serialize_Properly()
        {
            // Arrange
            var dtos = new List<ClientInfoDto>
            {
                new ClientInfoDto { DateRecorded = DateTime.UtcNow, IpAddress = "192.168.1.1", Os = "Windows" },
                new ClientInfoDto { DateRecorded = DateTime.UtcNow, IpAddress = "10.0.0.1", Os = "macOS" }
            };

            // Act
            var jsonList = _mapper.Map<List<string>?>(dtos);

            // Assert
            jsonList.Should().NotBeNull();
            jsonList.Should().HaveCount(2);
            jsonList[0].Should().Contain("192.168.1.1");
            jsonList[1].Should().Contain("10.0.0.1");
        }

        [Test]
        public void List_String_To_List_ClientInfoDto_Should_Deserialize_Properly()
        {
            // Arrange
            var dto1 = new ClientInfoDto { DateRecorded = DateTime.UtcNow, IpAddress = "192.168.1.1", Os = "Windows" };
            var dto2 = new ClientInfoDto { DateRecorded = DateTime.UtcNow, IpAddress = "10.0.0.1", Os = "macOS" };

            var jsonList = new List<string>
            {
                JsonSerializer.Serialize(dto1, new JsonSerializerOptions { PropertyNameCaseInsensitive = true, AllowTrailingCommas = true }),
                JsonSerializer.Serialize(dto2, new JsonSerializerOptions { PropertyNameCaseInsensitive = true, AllowTrailingCommas = true })
            };

            // Act
            var dtos = _mapper.Map<List<ClientInfoDto>?>(jsonList);

            // Assert
            dtos.Should().NotBeNull();
            dtos.Should().HaveCount(2);
            dtos[0].IpAddress.Should().Be("192.168.1.1");
            dtos[1].IpAddress.Should().Be("10.0.0.1");
        }

        [Test]
        public void Null_ClientInfoDto_Should_Map_To_Null_String()
        {
            // Arrange
            ClientInfoDto? dto = null;

            // Act
            var result = _mapper.Map<string?>(dto);

            // Assert
            result.Should().BeNull();
        }

        [Test]
        public void Null_List_ClientInfoDto_Should_Map_To_Null_List_String()
        {
            // Arrange
            List<ClientInfoDto>? dtos = null;

            // Act
            var result = _mapper.Map<List<string>?>(dtos);

            // Assert
            result.Should().BeNull();
        }

        [Test]
        public void Null_String_Should_Map_To_Null_ClientInfoDto()
        {
            // Arrange
            string? json = null;

            // Act
            var result = _mapper.Map<ClientInfoDto>(json);

            // Assert
            result.Should().BeNull();
        }

        [Test]
        public void Null_List_String_Should_Map_To_Null_List_ClientInfoDto()
        {
            // Arrange
            List<string>? jsonList = null;

            // Act
            var result = _mapper.Map<List<ClientInfoDto>?>(jsonList);

            // Assert
            result.Should().BeNull();
        }

        [Test]
        public void GuestDto_With_ClientInfos_Should_Map_Correctly()
        {
            // Arrange
            var clientInfo1 = new ClientInfoDto
            {
                DateRecorded = new DateTime(2025, 3, 12, 12, 0, 0, DateTimeKind.Utc),
                IpAddress = "192.168.1.1",
                Os = "Windows",
                Language = "en-US",
                TimeZone = "America/New_York",
                Referrer = "https://www.example.com"
            };
            var clientInfo2 = new ClientInfoDto
            {
                DateRecorded = new DateTime(2025, 3, 12, 12, 30, 0, DateTimeKind.Utc),
                IpAddress = "10.0.0.1",
                Os = "macOS",
                Language = "en-US",
                TimeZone = "America/Los_Angeles",
                Referrer = "https://www.google.com"
            };

            var guestDto = new GuestDto
            {
                InvitationCode = "INV123",
                GuestId = "GUEST123",
                GuestNumber = 1,
                Auth0Id = "auth0|123",
                FirstName = "John",
                AdditionalFirstNames = new List<string> { "Johnny" },
                LastName = "Doe",
                Roles = new List<RoleEnum> { RoleEnum.Guest },
                Email = new VerifiedDto { /* Populate as needed */ },
                Phone = new VerifiedDto { /* Populate as needed */ },
                Rsvp = new RsvpDto { InvitationResponse = InvitationResponseEnum.Interested },
                Preferences = new PreferencesDto { SleepPreference = SleepPreferenceEnum.Camping },
                ClientInfos = new List<ClientInfoDto> { clientInfo1, clientInfo2 },
                AgeGroup = AgeGroupEnum.Adult,
                LastActivity = DateTime.UtcNow
            };

            // Act
            // Map GuestDto to WeddingEntity; this will convert ClientInfos to List<string>
            var weddingEntity = _mapper.Map<WeddingEntity>(guestDto);
            // Now map back to GuestDto; this will deserialize the JSON strings back into ClientInfoDto objects
            var mappedGuestDto = _mapper.Map<GuestDto>(weddingEntity);

            // Assert
            weddingEntity.ClientInfos.Should().NotBeNull();
            weddingEntity.ClientInfos.Should().HaveCount(2);
            // Check that the JSON strings contain expected content.
            weddingEntity.ClientInfos[0].Should().Contain("192.168.1.1");
            weddingEntity.ClientInfos[1].Should().Contain("10.0.0.1");

            mappedGuestDto.ClientInfos.Should().NotBeNull();
            mappedGuestDto.ClientInfos.Should().HaveCount(2);
            mappedGuestDto.ClientInfos[0].IpAddress.Should().Be("192.168.1.1");
            mappedGuestDto.ClientInfos[0].Os.Should().Be("Windows");
            mappedGuestDto.ClientInfos[1].IpAddress.Should().Be("10.0.0.1");
            mappedGuestDto.ClientInfos[1].Os.Should().Be("macOS");
        }
    }
}
