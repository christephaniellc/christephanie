using AutoMapper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Mapping
{
    [TestFixture]
    [UnitTestsFor(typeof(WeddingEntityMappingProfile))]
    public class WeddingEntityMappingProfileTests
    {
        private IMapper _mapper;

        [SetUp]
        public void SetUp()
        {
            var config = new MapperConfiguration(
                cfg => cfg.AddProfile<WeddingEntityMappingProfile>());
            _mapper = config.CreateMapper();
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
            Assert.AreEqual(entity.InvitationResponseNotes, dto.RsvpNotes);
            Assert.AreEqual(entity.GuestLastLogin, dto.GuestLastLogin);
            Assert.IsNull(dto.Rsvp);
            Assert.IsNull(dto.Preferences);
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
    }
}
