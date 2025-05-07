using AutoMapper;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Mapping
{
    [UnitTestsFor(typeof(PaymentEntityToDtoMapping))]
    [TestFixture]
    public class PaymentEntityToDtoMappingTests
    {
        private IMapper _mapper;

        [SetUp]
        public void SetUp()
        {
            var config = new MapperConfiguration(
                cfg => cfg.AddProfiles(PaymentEntityToDtoMapping.Profiles()));
            _mapper = config.CreateMapper();
        }
        [Test]
        public void AutoMapper_Configuration_IsValid()
        {
            var config = new MapperConfiguration(cfg =>
            {
                foreach (var profile in PaymentEntityToDtoMapping.Profiles())
                {
                    cfg.AddProfile(profile);
                }
            });

            config.AssertConfigurationIsValid();
        }

        [Test]
        public void Map_PaymentIntentEntity_To_ContributionDto()
        {
            var entity = new PaymentIntentEntity
            {
                PaymentIntentId = "pi_test_123",
                InvitationCode = "ABCDE",
                GuestId = "guest_456",
                Amount = 9900,
                Currency = "usd",
                GiftCategory = "Bar Fund",
                GiftNotes = "Buy something nice 🍸",
                GuestName = "Jane Doe",
                IsAnonymous = true,
                Timestamp = "2025-04-02T10:00:00Z",
                PartitionKey = "PAYMENT#pi_test_123",
                SortKey = "METADATA#2025-04-02T10:00:00Z",
                GuestIdGSI = "GUEST#guest_456",
                GuestSortKey = "2025-04-02T10:00:00Z",
                GiftCategoryGSI = "CATEGORY#Bar Fund",
                CategorySortKey = "2025-04-02T10:00:00Z"
            };

            var dto = _mapper.Map<ContributionDto>(entity);

            Assert.That(dto.PaymentIntentId, Is.EqualTo(entity.PaymentIntentId));
            Assert.That(dto.GuestId, Is.EqualTo(entity.GuestId));
            Assert.That(dto.Amount, Is.EqualTo((int)entity.Amount));
            Assert.That(dto.Currency, Is.EqualTo(entity.Currency));
            Assert.That(dto.GiftCategory, Is.EqualTo(entity.GiftCategory));
            Assert.That(dto.GiftNotes, Is.EqualTo(entity.GiftNotes));
            Assert.That(dto.GuestName, Is.EqualTo(entity.GuestName));
            Assert.That(dto.IsAnonymous, Is.True);
            Assert.That(dto.Timestamp, Is.EqualTo(entity.Timestamp));
        }

        [Test]
        public void Map_ContributionDto_To_PaymentIntentEntity()
        {
            var dto = new ContributionDto
            {
                PaymentIntentId = "pi_test_123",
                GuestId = "guest_456",
                Amount = 9900,
                Currency = "usd",
                GiftCategory = "Bar Fund",
                GiftNotes = "Buy something nice 🍸",
                GuestName = "Jane Doe",
                IsAnonymous = true,
                Timestamp = "2025-04-02T10:00:00Z"
            };

            var entity = _mapper.Map<PaymentIntentEntity>(dto);

            Assert.That(entity.PartitionKey, Is.EqualTo("PAYMENT#pi_test_123"));
            Assert.That(entity.SortKey, Is.EqualTo("METADATA#2025-04-02T10:00:00Z"));
            Assert.That(entity.GuestIdGSI, Is.EqualTo("GUEST#guest_456"));
            Assert.That(entity.GuestSortKey, Is.EqualTo("2025-04-02T10:00:00Z"));
            Assert.That(entity.GiftCategoryGSI, Is.EqualTo("CATEGORY#Bar Fund"));
            Assert.That(entity.CategorySortKey, Is.EqualTo("2025-04-02T10:00:00Z"));
            Assert.That(entity.Amount, Is.EqualTo(9900L));
            Assert.That(entity.Currency, Is.EqualTo("usd"));
        }
    }
}
