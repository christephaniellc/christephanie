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
        public void Should_Map_WeddingEntity_To_FamilyUnitDto()
        {
            var entity = new WeddingEntity
            {
                InvitationCode = "RSVP123",
                UnitName = "Smith Family",
                Tier = "A",
                InvitationResponseNotes = "Looking forward to it!",
                MailingAddress = new AddressDto
                {
                    StreetAddress = "123 Main St.",
                    City = "Seattle",
                    State = "WA"
                }.ToString(),
                AdditionalAddresses = new List<string>
                {
                    new AddressDto
                    {
                        StreetAddress = "456 Elm St",
                        City = "Washington",
                        State = "DC"
                    }.ToString()

                },
                PotentialHeadCount = 5,
                FamilyUnitLastLogin = DateTime.Now
            };

            var dto = _mapper.Map<FamilyUnitDto>(entity);

            dto.InvitationCode.Should().Be(entity.InvitationCode);
            dto.UnitName.Should().Be(entity.UnitName);
            dto.Tier.Should().Be(entity.Tier);
            dto.InvitationResponseNotes.Should().Be(entity.InvitationResponseNotes);
            dto.MailingAddress.ToString().Should().Be(entity.MailingAddress);
            dto.AdditionalAddresses[0].ToString().Should().BeEquivalentTo(entity.AdditionalAddresses[0]);
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
        public void Should_Map_WeddingEntity_To_RsvpDto()
        {
            var entity = new WeddingEntity
            {
                GuestId = Guid.NewGuid().ToString(),
                InvitationResponse = InvitationResponseEnum.Pending,
                RsvpWedding = RsvpEnum.Attending,
                SleepPreference = SleepPreferenceEnum.Camping,
                RsvpRehearsalDinner = null,
                RsvpFourthOfJuly = RsvpEnum.Attending,
                RsvpBuildWeek = RsvpEnum.Declined,
                ArrivalDate = DateTime.Now
            };

            var dto = _mapper.Map<RsvpDto>(entity);

            dto.InvitationResponse.Should().Be(entity.InvitationResponse);
            dto.Wedding.Should().Be(entity.RsvpWedding);
            dto.SleepPreference.Should().Be(entity.SleepPreference);
            dto.RehearsalDinner.Should().Be(entity.RsvpRehearsalDinner);
            dto.FourthOfJuly.Should().Be(entity.RsvpFourthOfJuly);
            dto.BuildWeek.Should().Be(entity.RsvpBuildWeek);
            dto.ArrivalDate.Should().Be(entity.ArrivalDate);
        }

        [Test]
        public void Should_Map_WeddingEntity_To_PreferencesDto()
        {
            var entity = new WeddingEntity
            {
                GuestId = Guid.NewGuid().ToString(),
                PrefMeal = MealPreferenceEnum.Omnivore,
                PrefKidsPortion = true,
                PrefFoodAllergies = "Peanuts",
                PrefSpecialAlcoholRequests = "Non-alcoholic beer"
            };

            var dto = _mapper.Map<PreferencesDto>(entity);

            dto.Meal.Should().Be(entity.PrefMeal);
            dto.KidsPortion.Should().Be(entity.PrefKidsPortion);
            dto.FoodAllergies.Should().Be(entity.PrefFoodAllergies);
            dto.SpecialAlcoholRequests.Should().Be(entity.PrefSpecialAlcoholRequests);
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
                        AgeGroup = AgeGroupEnum.Child,
                        Roles = new List<RoleEnum> { RoleEnum.Staff },
                        Rsvp = new RsvpDto
                        {
                            InvitationResponse = InvitationResponseEnum.Interested,
                            Wedding = RsvpEnum.Attending,
                            SleepPreference = SleepPreferenceEnum.Camping,
                            ArrivalDate = System.DateTime.Now
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
                PrefMeal = MealPreferenceEnum.Vegan,
                PrefSpecialAlcoholRequests = "Whiskey"
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
            dto.Preferences!.Meal.Should().Be(entity.PrefMeal);
            dto.Preferences.SpecialAlcoholRequests.Should().Be(entity.PrefSpecialAlcoholRequests);
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
                AgeGroup = AgeGroupEnum.Child,
                Roles = new List<RoleEnum> { RoleEnum.Staff },
                Rsvp = new RsvpDto
                {
                    InvitationResponse = InvitationResponseEnum.Interested,
                    Wedding = RsvpEnum.Attending,
                    SleepPreference = SleepPreferenceEnum.Camping,
                    ArrivalDate = System.DateTime.Now
                },
                Preferences = new PreferencesDto
                {
                    Meal = MealPreferenceEnum.Omnivore,
                    KidsPortion = true,
                    FoodAllergies = "Peanuts",
                    SpecialAlcoholRequests = "Non-alcoholic beer"
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
            entity.RsvpBuildWeek.Should().Be(guestDto.Rsvp.BuildWeek);
            entity.SleepPreference.Should().Be(guestDto.Rsvp.SleepPreference);
            entity.RsvpNotes.Should().Be(guestDto.Rsvp.RsvpNotes);

            entity.PrefMeal.Should().Be(guestDto.Preferences.Meal);
            entity.PrefKidsPortion.Should().Be(guestDto.Preferences.KidsPortion);
            entity.PrefFoodAllergies.Should().Be(guestDto.Preferences.FoodAllergies);
            entity.PrefSpecialAlcoholRequests.Should().Be(guestDto.Preferences.SpecialAlcoholRequests);
        }
    }
}
