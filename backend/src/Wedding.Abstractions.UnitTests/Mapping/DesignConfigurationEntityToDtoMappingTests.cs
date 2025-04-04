using FluentAssertions;
using System.Text.Json;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using AutoMapper;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Utility.Testing.TestChain;

[TestFixture]
[UnitTestsFor(typeof(DesignConfigurationEntityToDtoMapping))]
public class DesignConfigurationEntityToDtoMappingTests
{
    private IMapper _mapper;

    [SetUp]
    public void SetUp()
    {
        _mapper = MappingProfileHelper.GetMapper();
    }

    [Test]
    public void Should_Map_Basic_Fields_And_Deserialize_ConfigurationData()
    {
        // Arrange
        var guestId = "guest-123";
        var designId = "design-abc";
        var dto = new InvitationDesignDto
        {
            GuestId = guestId,
            DesignId = designId,
            Orientation = OrientationEnum.Landscape,
            SeparatorColor = "#FF00FF",
            SeparatorWidth = 3,
            PhotoGridItems = new List<PhotoGridItemDto> { new() { PhotoSrc = "https://photo.url" } }
        };

        var entity = new DesignConfigurationEntity
        {
            PartitionKey = DynamoKeys.GetConfigurationPartitionKey(guestId),
            SortKey = DynamoKeys.GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum.Invitation, designId),
            GuestId = guestId,
            DesignId = designId,
            Name = "Our Wedding Invite",
            ConfigurationData = JsonSerializer.Serialize(dto)
        };

        // Act
        var result = _mapper.Map<InvitationDesignDto>(entity);

        // Assert
        result.Should().NotBeNull();
        result.GuestId.Should().Be(guestId);
        result.DesignId.Should().Be(designId);
        result.Name.Should().Be("Our Wedding Invite");

        result.Orientation.Should().Be(dto.Orientation);
        result.SeparatorWidth.Should().Be(dto.SeparatorWidth);
        result.SeparatorColor.Should().Be(dto.SeparatorColor);
        result.PhotoGridItems.Should().NotBeNull().And.HaveCount(1);
        result.PhotoGridItems![0].PhotoSrc.Should().Be("https://photo.url");
    }

    [Test]
    public void Should_Handle_Null_ConfigurationData()
    {
        // Arrange
        var entity = new DesignConfigurationEntity
        {
            PartitionKey = "GUEST#123",
            SortKey = "CONFIG#INVITATION#design-id",
            GuestId = "123",
            DesignId = "design-id",
            Name = "Test Design",
            ConfigurationData = null
        };

        // Act
        var result = _mapper.Map<InvitationDesignDto>(entity);

        // Assert
        result.Should().NotBeNull();
        result.Orientation.Should().BeNull();
        result.PhotoGridItems.Should().BeNull();
    }

    [Test]
    public void Should_Map_Dto_Back_To_Entity_With_Serialized_ConfigurationData()
    {
        // Arrange
        var dto = new InvitationDesignDto
        {
            GuestId = "guest-456",
            DesignId = "design-xyz",
            Name = "Cool Invite",
            Orientation = OrientationEnum.Portrait,
            SeparatorWidth = 2,
            SeparatorColor = "#00FF00",
            PhotoGridItems = new List<PhotoGridItemDto> { new() { PhotoSrc = "https://other.url" } }
        };

        // Act
        var entity = _mapper.Map<DesignConfigurationEntity>(dto);

        // Assert
        entity.Should().NotBeNull();
        entity.GuestId.Should().Be(dto.GuestId);
        entity.DesignId.Should().Be(dto.DesignId);
        entity.Name.Should().Be(dto.Name);
        entity.ConfigurationData.Should().NotBeNullOrEmpty();

        var config = JsonSerializer.Deserialize<InvitationDesignDto>(entity.ConfigurationData!);
        config.Should().NotBeNull();
        config!.SeparatorColor.Should().Be(dto.SeparatorColor);
        config.SeparatorWidth.Should().Be(dto.SeparatorWidth);
        config.Orientation.Should().Be(dto.Orientation);
        config.PhotoGridItems.Should().HaveCount(1);
    }
}
