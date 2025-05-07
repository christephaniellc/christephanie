using AutoMapper;
using FluentAssertions;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Mapping
{
    [UnitTestsFor(typeof(NotificationDataToDtoMapping))]
    [TestFixture]
    public class NotificationDataToDtoMappingTests
    {
        private IMapper _mapper;

        [SetUp]
        public void SetUp()
        {
            var config = new MapperConfiguration(cfg =>
                cfg.AddProfiles(NotificationDataToDtoMapping.Profiles()));
            _mapper = config.CreateMapper();
        }

        [Test]
        public void Should_Validate_Mapping_Configuration() =>
            _mapper.ConfigurationProvider.AssertConfigurationIsValid();


        [Test]
        public void Should_Map_Entity_To_Dto()
        {
            var entity = new NotificationDataEntity
            {
                PartitionKey = "EMAIL#abc123",
                SortKey = "2025-05-01T18:00:00Z#RSVP_REMINDER",
                GuestEmailLogId = "log-xyz",
                GuestId = "abc123",
                EmailType = CampaignTypeEnum.RsvpReminder,
                CampaignId = "campaign-001",
                Timestamp = "2025-05-01T18:00:00Z",
                DeliveryStatus = "SUCCESS",
                EmailAddress = "guest@example.com",
                Verified = true,
                Metadata = new Dictionary<string, string> { { "key", "value" } }
            };

            var dto = _mapper.Map<GuestEmailLogDto>(entity);

            dto.GuestEmailLogId.Should().Be("log-xyz");
            dto.GuestId.Should().Be("abc123");
            dto.CampaignType.Should().Be(CampaignTypeEnum.RsvpReminder);
            dto.CampaignId.Should().Be("campaign-001");
            dto.Timestamp.Should().Be("2025-05-01T18:00:00Z");
            dto.DeliveryStatus.Should().Be("SUCCESS");
            dto.EmailAddress.Should().Be("guest@example.com");
            dto.Verified.Should().BeTrue();
            dto.Metadata.Should().ContainKey("key").And.ContainValue("value");
        }

        [Test]
        public void Should_Map_Dto_To_Entity_With_Correct_Keys()
        {
            var dto = new GuestEmailLogDto
            {
                GuestEmailLogId = "log-xyz",
                GuestId = "abc123",
                CampaignType = CampaignTypeEnum.FourthDetails,
                CampaignId = "campaign-002",
                Timestamp = "2025-05-02T12:00:00Z",
                DeliveryStatus = "PENDING",
                EmailAddress = "invitee@example.com",
                Verified = false,
                Metadata = new Dictionary<string, string> { { "custom", "meta" } }
            };

            var entity = _mapper.Map<NotificationDataEntity>(dto);

            entity.PartitionKey.Should().Be("EMAIL#abc123");
            entity.SortKey.Should().Be("2025-05-02T12:00:00Z#FOURTH_DETAILS");

            entity.CampaignTypeIndexPartitionKey.Should().Be("CAMPAIGN#campaign-002");
            entity.CampaignTypeIndexSortKey.Should().Be("GUEST#abc123");

            entity.GuestEmailLogId.Should().Be("log-xyz");
            entity.GuestId.Should().Be("abc123");
            entity.EmailType.Should().Be(CampaignTypeEnum.FourthDetails);
            entity.CampaignId.Should().Be("campaign-002");
            entity.Timestamp.Should().Be("2025-05-02T12:00:00Z");
            entity.DeliveryStatus.Should().Be("PENDING");
            entity.EmailAddress.Should().Be("invitee@example.com");
            entity.Verified.Should().BeFalse();
            entity.Metadata.Should().ContainKey("custom").And.ContainValue("meta");
        }
    }
}
