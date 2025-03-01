using AutoMapper;
using FluentAssertions;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Mapping;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Abstractions.UnitTests.Mapping
{
    [UnitTestsFor(typeof(ViewModelToDtoMapping))]
    [TestFixture]
    public class ViewModelToDtoMappingTests
    {
        private IMapper _mapper;

        [SetUp]
        public void SetUp()
        {
            var config = new MapperConfiguration(
                cfg => cfg.AddProfiles(ViewModelToDtoMapping.Profiles()));
            _mapper = config.CreateMapper();
        }

        [Test]
        public void ShouldInitializeViewModel()
        {
            var familyUnitDto = TestDataHelper.FAMILY_DOE;

            var viewModel = _mapper.Map<FamilyUnitViewModel>(familyUnitDto);

            viewModel.MailingAddress.Should().NotBeNull();
            viewModel.Guests.Should().NotBeNull();
            viewModel.MailingAddress.Should().BeEquivalentTo(familyUnitDto.MailingAddress);
            viewModel.Guests.Should().BeEquivalentTo(familyUnitDto.Guests);
        }

        [Test]
        public void ShouldInitializeDto()
        {
            var familyUnitViewModel = new FamilyUnitViewModel
            {
                InvitationCode = "GHJKL",
                UnitName = "Smiths",
                Guests = new List<GuestDto>
                {
                    TestDataHelper.GUEST_JOHN,
                    TestDataHelper.GUEST_JANE
                },
                MailingAddress = new AddressDto
                {
                    StreetAddress = "123 Main St.",
                    City = "New York",
                    State = "NY"
                }
            };

            var dto = _mapper.Map<FamilyUnitDto>(familyUnitViewModel);

            dto.MailingAddress.Should().NotBeNull();
            dto.Guests.Should().NotBeNull();
            dto.Tier.Should().BeEmpty();
            dto.MailingAddress.Should().BeEquivalentTo(familyUnitViewModel.MailingAddress);
            dto.Guests.Should().BeEquivalentTo(familyUnitViewModel.Guests);
        }
        [Test]
        public void Mapping_ShouldMapBasicPropertiesCorrectly()
        {
            // Arrange
            var guestDto = new GuestDto
            {
                InvitationCode = "INV123",
                GuestId = "GUEST001",
                GuestNumber = 5,
                Auth0Id = "AUTH0ID123",
                FirstName = "John",
                AdditionalFirstNames = new List<string> { "Johnny", "J" },
                LastName = "Doe",
                Roles = new List<RoleEnum> { RoleEnum.Guest },
                Email = new VerifiedDto { Value = "john.doe@example.com", Verified = true },
                Phone = new VerifiedDto { Value = "1234567890", Verified = true },
                Rsvp = null,
                Preferences = null,
                AgeGroup = AgeGroupEnum.Adult,
                LastActivity = new DateTime(2023, 1, 1)
            };

            // Act
            var viewModel = _mapper.Map<GuestViewModel>(guestDto);

            // Assert basic mappings
            viewModel.InvitationCode.Should().Be("INV123");
            viewModel.GuestId.Should().Be("GUEST001");
            viewModel.GuestNumber.Should().Be(5);
            viewModel.Auth0Id.Should().Be("AUTH0ID123");
            viewModel.FirstName.Should().Be("John");
            viewModel.AdditionalFirstNames.Should().BeEquivalentTo(new List<string> { "Johnny", "J" });
            viewModel.LastName.Should().Be("Doe");
            viewModel.Roles.Should().BeEquivalentTo(new List<RoleEnum> { RoleEnum.Guest });
            viewModel.AgeGroup.Should().Be(AgeGroupEnum.Adult);
            viewModel.LastActivity.Should().Be(new DateTime(2023, 1, 1));
        }

        [Test]
        public void Mapping_ShouldMaskEmailCorrectly()
        {
            // Arrange
            var email = "smith@gmail.com"; // local part "smith" should become "s***h"
            var guestDto = new GuestDto
            {
                Email = new VerifiedDto { Value = email, Verified = true },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            // Act
            var viewModel = _mapper.Map<GuestViewModel>(guestDto);

            // Assert
            viewModel.Email.Should().NotBeNull();
            viewModel.Email.MaskedValue.Should().Be("s***h@gmail.com");
            viewModel.Email.Verified.Should().BeTrue();
        }

        [Test]
        public void Mapping_ShouldMaskPhoneCorrectly()
        {
            // Arrange
            var phone = "1234567890"; // should result in "xxx-xxx-7890"
            var guestDto = new GuestDto
            {
                Phone = new VerifiedDto { Value = phone, Verified = false },
                Roles = new List<RoleEnum> { RoleEnum.Guest }
            };

            // Act
            var viewModel = _mapper.Map<GuestViewModel>(guestDto);

            // Assert
            viewModel.Phone.Should().NotBeNull();
            viewModel.Phone.MaskedValue.Should().Be("+x-xxx-xxx-7890");
            viewModel.Phone.Verified.Should().BeFalse();
        }
    }
}
