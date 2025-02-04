using AutoMapper;
using FluentAssertions;
using Wedding.Abstractions.Dtos;
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
    }
}
