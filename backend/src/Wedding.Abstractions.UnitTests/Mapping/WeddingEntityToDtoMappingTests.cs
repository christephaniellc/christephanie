using System.Text.Json;
using AutoMapper;
using FluentAssertions;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Mapping
{
    [TestFixture]
    [UnitTestsFor(typeof(WeddingEntityToDtoMapping))]
    public class WeddingEntityToDtoMappingTests
    {
        private IMapper _mapper;

        [SetUp]
        public void SetUp()
        {
            var config = new MapperConfiguration(
                cfg => cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles()));
            _mapper = config.CreateMapper();
        }

        [Test]
        public void ShouldInitializeNestedPropertiesIfNull()
        {
            var entity = new WeddingEntity
            {
                GuestId = "123"
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
                InvitationCode = "INV123",
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
                InvitationCode = "RSVP123",
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
            dto.MailingAddress.UspsVerified.Should().BeTrue();
            dto.AdditionalAddresses[0].Should().BeEquivalentTo(address2);
            dto.AdditionalAddresses[0].UspsVerified.Should().BeFalse();
            dto.PotentialHeadCount.Should().Be(entity.PotentialHeadCount);
            dto.FamilyUnitLastLogin.Should().Be(entity.FamilyUnitLastLogin);
            dto.Guests.Should().BeNull();
        }

        [Test]
        public void Should_Map_WeddingEntity_To_GuestDto()
        {
            var entity = new WeddingEntity
            {
                GuestId = Guid.NewGuid().ToString(),
                Auth0Id = "auth0|123456",
                FirstName = "Jon",
                AdditionalFirstNames = new List<string> { "Jonathan", "Jojo"},
                LastName = "Doe",
                Roles = new List<RoleEnum> { RoleEnum.Admin },
                Email = "john.doe@example.com",
                Phone = "123-456-7890",
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
            dto.Email.Should().Be(entity.Email);
            dto.Phone.Should().Be(entity.Phone);
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

            dto.GuestId.Should().Be(entity.GuestId);
            dto.Auth0Id.Should().Be(entity.Auth0Id);
            dto.FirstName.Should().Be(entity.FirstName);
            dto.AdditionalFirstNames.Should().BeEquivalentTo(entity.AdditionalFirstNames);
            dto.LastName.Should().Be(entity.LastName);
            dto.Roles.Should().BeEquivalentTo(entity.Roles);
            dto.Email.Should().Be(entity.Email);
            dto.Phone.Should().Be(entity.Phone);
            dto.AgeGroup.Should().Be(entity.AgeGroup);
            dto.LastActivity.Should().Be(entity.LastActivity);
            dto.Rsvp.Should().NotBeNull();
            dto.Rsvp!.InvitationResponse.Should().Be(entity.InvitationResponse);
            EmptyObjectHelper.ObjectPropertiesAreNullOrEmpty(dto.Preferences!).Should().BeTrue();
        }

        [Test]
        public void Should_Map_WeddingEntity_To_RsvpDto()
        {
            var audit = new LastUpdateAuditDto
            {
                LastUpdate = DateTime.UtcNow,
                Username = "me"
            };
            var entity = new WeddingEntity
            {
                GuestId = Guid.NewGuid().ToString(),
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
            dto.RsvpAudit.LastUpdate.Should().Be(audit.LastUpdate);
            dto.RsvpAudit.Username.Should().Be(audit.Username);
        }

        [Test]
        public void Should_Map_WeddingEntity_To_PreferencesDto()
        {
            var entity = new WeddingEntity
            {
                GuestId = Guid.NewGuid().ToString(),
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
                        Email = "jingleheimersmith@gmai.com",
                        Phone = "123-456-7890",
                        AgeGroup = AgeGroupEnum.Under13,
                        Roles = new List<RoleEnum> { RoleEnum.Staff },
                        Rsvp = new RsvpDto
                        {
                            InvitationResponse = InvitationResponseEnum.Interested,
                            Wedding = RsvpEnum.Attending
                        },
                        LastActivity = System.DateTime.Now,
                    },
                    new GuestDto { GuestId = Guid.NewGuid().ToString() }
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
            entity.AdditionalAddresses[0].Should().BeEquivalentTo(dto.AdditionalAddresses[0].ToString());
            entity.PotentialHeadCount.Should().Be(dto.Guests.Count);
            entity.PrefFood.Should().BeNull();
            entity.FamilyUnitLastLogin.Should().Be(dto.FamilyUnitLastLogin);
        }

        [Test]
        public void Should_Map_WeddingEntity_To_GuestDto_WithPrefs()
        {
            var entity = new WeddingEntity
            {
                GuestId = "123",
                GuestNumber = 1,
                Auth0Id = "auth0|test",
                FirstName = "John",
                LastName = "Doe",
                Roles = new List<RoleEnum> { RoleEnum.Guest },
                Email = "john.doe@example.com",
                Phone = "123-456-7890",
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
            dto.Email.Should().Be(entity.Email);
            dto.Phone.Should().Be(entity.Phone);
            dto.AgeGroup.Should().Be(entity.AgeGroup);
            dto.Rsvp.Should().NotBeNull();
            dto.Rsvp!.InvitationResponse.Should().Be(entity.InvitationResponse);
            dto.Rsvp.Wedding.Should().Be(entity.RsvpWedding);
            dto.Preferences.Should().NotBeNull();
            dto.Preferences!.FoodPreference.Should().Be(entity.PrefFood);
        }

        [Test]
        public void Should_Map_GuestDto_To_WeddingEntity()
        {
            // Arrange
            var guestDto = new GuestDto
            {
                GuestId = Guid.NewGuid().ToString(),
                GuestNumber = 1,
                FirstName = "John",
                LastName = "Jingleheimer",
                Email = "jingleheimersmith@gmail.com",
                Phone = "123-456-7890",
                AgeGroup = AgeGroupEnum.Under13,
                Roles = new List<RoleEnum> { RoleEnum.Staff },
                Rsvp = new RsvpDto
                {
                    InvitationResponse = InvitationResponseEnum.Interested,
                    Wedding = RsvpEnum.Attending,
                },
                Preferences = new PreferencesDto
                {
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
            entity.Email.Should().Be(guestDto.Email);
            entity.Phone.Should().Be(guestDto.Phone);
            entity.LastActivity.Should().Be(guestDto.LastActivity);

            entity.InvitationResponse.Should().Be(guestDto.Rsvp.InvitationResponse);
            entity.RsvpWedding.Should().Be(guestDto.Rsvp.Wedding);
            entity.RsvpRehearsalDinner.Should().Be(guestDto.Rsvp.RehearsalDinner);
            entity.RsvpFourthOfJuly.Should().Be(guestDto.Rsvp.FourthOfJuly);
            entity.RsvpNotes.Should().Be(guestDto.Rsvp.RsvpNotes);

            entity.PrefSleep.Should().Be(guestDto.Preferences.SleepPreference);
            entity.PrefFood.Should().Be(guestDto.Preferences.FoodPreference);
            entity.PrefFoodAllergies.Should().BeEquivalentTo(guestDto.Preferences.FoodAllergies);
        }
    }
}
