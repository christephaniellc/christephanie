using AutoMapper;
using FluentAssertions;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.USPS;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Mapping
{
    [UnitTestsFor(typeof(AddressToDtoMapping))]
    [TestFixture]
    public class AddressToDtoMapptingTests
    {
        private IMapper _mapper;

        [SetUp]
        public void Setup()
        {
            var config = new MapperConfiguration(cfg => 
                cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>());
            _mapper = config.CreateMapper();
        }

        [Test]
        public void Map_StringToAddressDto_WithLineBreaks()
        {
            // Arrange
            string input = "123 Main St\nApt 4B\nAnytown\nCA\n90210\nUSA";

            // Act
            var result = _mapper.Map<AddressDto>(input);

            // Assert
            result.StreetAddress.Should().Be("123 Main St");
            result.SecondaryAddress.Should().Be("Apt 4B");
            result.City.Should().Be("Anytown");
            result.State.Should().Be("CA");
            result.ZIPCode.Should().Be("90210");
            result.Country.Should().Be("USA");
        }

        [Test]
        public void Map_StringToAddressDto_WithCommas()
        {
            // Arrange
            string input = "123 Main St, Apt 4B, Anytown, CA, 90210, USA";

            // Act
            var result = _mapper.Map<AddressDto>(input);

            // Assert
            result.StreetAddress.Should().Be("123 Main St");
            result.SecondaryAddress.Should().Be("Apt 4B");
            result.City.Should().Be("Anytown");
            result.State.Should().Be("CA");
            result.ZIPCode.Should().Be("90210");
            result.Country.Should().Be("USA");
        }

        [Test]
        public void Map_StringToAddressDto_WithMissingFields()
        {
            // Arrange
            string input = "123 Main St\nApt 4B\nAnytown\nCA";

            // Act
            var result = _mapper.Map<AddressDto>(input);

            // Assert
            result.StreetAddress.Should().Be("123 Main St");
            result.SecondaryAddress.Should().Be("Apt 4B");
            result.City.Should().Be("Anytown");
            result.State.Should().Be("CA");
            result.ZIPCode.Should().BeNull();
            result.Country.Should().BeNull();
        }

        [Test]
        public void Map_StringToAddressDto_WithExtraLines()
        {
            // Arrange
            string input = "123 Main St\nApt 4B\nAnytown\nCA\n90210\nUSA\nExtra Line";

            // Act
            var result = _mapper.Map<AddressDto>(input);

            // Assert
            result.StreetAddress.Should().Be("123 Main St");
            result.SecondaryAddress.Should().Be("Apt 4B");
            result.City.Should().Be("Anytown");
            result.State.Should().Be("CA");
            result.ZIPCode.Should().Be("90210");
            result.Country.Should().Be("USA");
        }

        [Test]
        public void Map_StringToAddressDto_EmptyInput_ThrowsException()
        {
            // Arrange
            string input = "";

            // Act & Assert
            Assert.Throws<AutoMapperMappingException>(() => _mapper.Map<AddressDto>(input));
        }

        [Test]
        public void Map_UspsAddressDto_To_AddressDto_ValidMapping()
        {
            // Arrange
            var uspsAddressDto = new UspsAddressDto
            {
                Firm = "Example Firm",
                Address = new AddressDto
                {
                    StreetAddress = "123 Main St",
                    City = "Springfield",
                    State = "IL",
                    ZIPCode = "62704"
                },
                AdditionalInfo = new UspsAdditionalInfoDto(),
                Corrections = new List<UspsCorrectionDto>(),
                Matches = new List<UspsMatchDto>(),
                Warnings = new List<string>()
            };

            // Act
            var result = _mapper.Map<AddressDto>(uspsAddressDto);

            // Assert
            result.Should().NotBeNull();
            result.StreetAddress.Should().Be("123 Main St");
            result.City.Should().Be("Springfield");
            result.State.Should().Be("IL");
            result.ZIPCode.Should().Be("62704");
        }

        [Test]
        public void Map_UspsAddressDto_With_NullAddress_ReturnsNull()
        {
            // Arrange
            var uspsAddressDto = new UspsAddressDto
            {
                Firm = "Example Firm",
                Address = null
            };

            // Act
            var result = _mapper.Map<AddressDto>(uspsAddressDto);

            // Assert
            result.Should().BeNull();
        }
    }
}
