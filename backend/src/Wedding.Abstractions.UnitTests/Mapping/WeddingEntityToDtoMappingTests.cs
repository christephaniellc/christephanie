using AutoMapper;
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

            Assert.NotNull(dto.Rsvp);
            Assert.NotNull(dto.Preferences);
        }

        [Test]
        public void Should_Map_WeddingEntity_To_FamilyUnitDto()
        {
            var entity = new WeddingEntity
            {
                RsvpCode = "RSVP123",
                UnitName = "Smith Family",
                Tier = "A",
                InvitationResponseNotes = "Looking forward to it!",
                MailingAddress = "123 Main St",
                AdditionalAddresses = new List<string> { "456 Elm St" },
                PotentialHeadCount = 5,
                FamilyUnitLastLogin = DateTime.Now
            };

            var dto = _mapper.Map<FamilyUnitDto>(entity);

            Assert.AreEqual(entity.RsvpCode, dto.RsvpCode);
            Assert.AreEqual(entity.UnitName, dto.UnitName);
            Assert.AreEqual(entity.Tier, dto.Tier);
            Assert.AreEqual(entity.InvitationResponseNotes, dto.InvitationResponseNotes);
            Assert.AreEqual(entity.MailingAddress, dto.MailingAddress);
            Assert.AreEqual(entity.AdditionalAddresses, dto.AdditionalAddresses);
            Assert.AreEqual(entity.PotentialHeadCount, dto.PotentialHeadCount);
            Assert.AreEqual(entity.FamilyUnitLastLogin, dto.FamilyUnitLastLogin);
            Assert.IsNull(dto.Guests);
        }

        [Test]
        public void Should_Map_WeddingEntity_To_GuestDto()
        {
            var entity = new WeddingEntity
            {
                GuestId = Guid.NewGuid().ToString(),
                Auth0Id = "auth0|123456",
                FirstName = "John",
                LastName = "Doe",
                Roles = new List<RoleEnum> { RoleEnum.Admin },
                Email = "john.doe@example.com",
                Phone = "123-456-7890",
                AgeGroup = AgeGroupEnum.Adult,
                InvitationResponseNotes = "Can't wait!",
                GuestLastLogin = DateTime.Now
            };

            var dto = _mapper.Map<GuestDto>(entity);

            Assert.AreEqual(entity.GuestId, dto.GuestId);
            Assert.AreEqual(entity.Auth0Id, dto.Auth0Id);
            Assert.AreEqual(entity.FirstName, dto.FirstName);
            Assert.AreEqual(entity.LastName, dto.LastName);
            Assert.AreEqual(entity.Roles, dto.Roles);
            Assert.AreEqual(entity.Email, dto.Email);
            Assert.AreEqual(entity.Phone, dto.Phone);
            Assert.AreEqual(entity.AgeGroup, dto.AgeGroup);
            Assert.AreEqual(entity.GuestLastLogin, dto.GuestLastLogin);
            Assert.AreEqual(entity.InvitationResponse, dto.Rsvp.InvitationResponse);
            Assert.True(EmptyObjectHelper.ObjectPropertiesAreNullOrEmpty(dto.Preferences));
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

            Assert.AreEqual(entity.GuestId, dto.GuestId);
            Assert.AreEqual(entity.InvitationResponse, dto.InvitationResponse);
            Assert.AreEqual(entity.RsvpWedding, dto.Wedding);
            Assert.AreEqual(entity.SleepPreference, dto.SleepPreference);
            Assert.AreEqual(entity.RsvpRehearsalDinner, dto.RehearsalDinner);
            Assert.AreEqual(entity.RsvpFourthOfJuly, dto.FourthOfJuly);
            Assert.AreEqual(entity.RsvpBuildWeek, dto.BuildWeek);
            Assert.AreEqual(entity.ArrivalDate, dto.ArrivalDate);
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

            Assert.AreEqual(entity.GuestId, dto.GuestId);
            Assert.AreEqual(entity.PrefMeal, dto.Meal);
            Assert.AreEqual(entity.PrefKidsPortion, dto.KidsPortion);
            Assert.AreEqual(entity.PrefFoodAllergies, dto.FoodAllergies);
            Assert.AreEqual(entity.PrefSpecialAlcoholRequests, dto.SpecialAlcoholRequests);
        }

        [Test]
        public void Should_Map_FamilyUnitDto_To_WeddingEntity()
        {
            // Arrange
            var familyUnitDto = new FamilyUnitDto
            {
                RsvpCode = "RSVP123",
                UnitName = "Smith Family",
                Tier = "Gold",
                InvitationResponseNotes = "Looking forward to it!",
                MailingAddress = "123 Main St",
                AdditionalAddresses = new List<string> { "456 Elm St" },
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
                        GuestLastLogin = System.DateTime.Now,
                    },
                    new GuestDto { GuestId = Guid.NewGuid().ToString() }
                },
                FamilyUnitLastLogin = System.DateTime.Now
            };

            // Act
            var weddingEntity = _mapper.Map<WeddingEntity>(familyUnitDto);

            // Assert
            Assert.AreEqual(familyUnitDto.RsvpCode, weddingEntity.RsvpCode);
            Assert.AreEqual(familyUnitDto.UnitName, weddingEntity.UnitName);
            Assert.AreEqual(familyUnitDto.Tier, weddingEntity.Tier);
            Assert.AreEqual(familyUnitDto.InvitationResponseNotes, weddingEntity.InvitationResponseNotes);
            Assert.AreEqual(familyUnitDto.MailingAddress, weddingEntity.MailingAddress);
            Assert.AreEqual(familyUnitDto.AdditionalAddresses, weddingEntity.AdditionalAddresses);
            Assert.AreEqual(familyUnitDto.Guests.Count, weddingEntity.PotentialHeadCount);
            Assert.AreEqual(familyUnitDto.FamilyUnitLastLogin, weddingEntity.FamilyUnitLastLogin);
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
                GuestLastLogin = DateTime.UtcNow,
                InvitationResponse = InvitationResponseEnum.Interested,
                RsvpWedding = RsvpEnum.Attending,
                PrefMeal = MealPreferenceEnum.Vegan,
                PrefSpecialAlcoholRequests = "Whiskey"
            };

            var dto = _mapper.Map<GuestDto>(entity);

            Assert.AreEqual(entity.GuestId, dto.GuestId);
            Assert.AreEqual(entity.GuestNumber, dto.GuestNumber);
            Assert.AreEqual(entity.FirstName, dto.FirstName);
            Assert.AreEqual(entity.LastName, dto.LastName);
            Assert.AreEqual(entity.Email, dto.Email);
            Assert.AreEqual(entity.Phone, dto.Phone);
            Assert.AreEqual(entity.AgeGroup, dto.AgeGroup);
            Assert.AreEqual(entity.InvitationResponse, dto.Rsvp.InvitationResponse);
            Assert.AreEqual(entity.RsvpWedding, dto.Rsvp.Wedding);
            Assert.AreEqual(entity.PrefMeal, dto.Preferences.Meal);
            Assert.AreEqual(entity.PrefSpecialAlcoholRequests, dto.Preferences.SpecialAlcoholRequests);
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
                GuestLastLogin = System.DateTime.Now,
            };

            // Act
            var weddingEntity = _mapper.Map<WeddingEntity>(guestDto);

            // Assert
            Assert.AreEqual(guestDto.GuestId, weddingEntity.GuestId);
            Assert.AreEqual(guestDto.GuestNumber, weddingEntity.GuestNumber);
            Assert.AreEqual(guestDto.Auth0Id, weddingEntity.Auth0Id);
            Assert.AreEqual(guestDto.FirstName, weddingEntity.FirstName);
            Assert.AreEqual(guestDto.LastName, weddingEntity.LastName);
            Assert.AreEqual(guestDto.AgeGroup, weddingEntity.AgeGroup);
            Assert.AreEqual(guestDto.Roles, weddingEntity.Roles);
            Assert.AreEqual(guestDto.Email, weddingEntity.Email);
            Assert.AreEqual(guestDto.Phone, weddingEntity.Phone);
            Assert.AreEqual(guestDto.GuestLastLogin, weddingEntity.GuestLastLogin);

            Assert.AreEqual(guestDto.Rsvp.InvitationResponse, weddingEntity.InvitationResponse);
            Assert.AreEqual(guestDto.Rsvp.Wedding, weddingEntity.RsvpWedding);
            Assert.AreEqual(guestDto.Rsvp.RehearsalDinner, weddingEntity.RsvpRehearsalDinner);
            Assert.AreEqual(guestDto.Rsvp.FourthOfJuly, weddingEntity.RsvpFourthOfJuly);
            Assert.AreEqual(guestDto.Rsvp.BuildWeek, weddingEntity.RsvpBuildWeek);
            Assert.AreEqual(guestDto.Rsvp.SleepPreference, weddingEntity.SleepPreference);
            Assert.AreEqual(guestDto.Rsvp.RsvpNotes, weddingEntity.RsvpNotes);

            Assert.AreEqual(guestDto.Preferences.Meal, weddingEntity.PrefMeal);
            Assert.AreEqual(guestDto.Preferences.KidsPortion, weddingEntity.PrefKidsPortion);
            Assert.AreEqual(guestDto.Preferences.FoodAllergies, weddingEntity.PrefFoodAllergies);
            Assert.AreEqual(guestDto.Preferences.SpecialAlcoholRequests, weddingEntity.PrefSpecialAlcoholRequests);
        }
    }
}
