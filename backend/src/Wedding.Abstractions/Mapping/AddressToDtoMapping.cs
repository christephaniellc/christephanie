using System;
using AutoMapper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.USPS;

namespace Wedding.Abstractions.Mapping
{
    public class AddressToDtoMapping
    {
        public class AddressToDtoMappingProfile : Profile
        {
            public AddressToDtoMappingProfile()
            {
                CreateMap<string, AddressDto>()
                    .ConstructUsing((addressString, context) =>
                    {
                        if (string.IsNullOrWhiteSpace(addressString))
                        {
                            throw new AutoMapperMappingException("Input string cannot be null or empty");
                        }

                        var parts = addressString.Split(new[] { "\r\n", "\n", "," }, StringSplitOptions.RemoveEmptyEntries);

                        return new AddressDto
                        {
                            StreetAddress = parts.Length > 0 ? parts[0].Trim() : null,
                            SecondaryAddress = parts.Length > 1 ? parts[1].Trim() : null,
                            City = parts.Length > 2 ? parts[2].Trim() : null,
                            State = parts.Length > 3 ? parts[3].Trim() : null,
                            ZIPCode = parts.Length > 4 ? parts[4].Trim() : null,
                            Country = parts.Length > 5 ? parts[5].Trim() : null
                        };
                    });

                CreateMap<AddressDto, AddressDto>()
                    .ForMember(dest => dest.StreetAddress, opt => opt.MapFrom(src => src.StreetAddress))
                    .ForMember(dest => dest.SecondaryAddress, opt => opt.MapFrom(src => src.SecondaryAddress))
                    .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                    .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.State.ToUpper()))
                    .ForMember(dest => dest.ZIPCode, opt => opt.MapFrom(src => src.ZIPCode))
                    .ForMember(dest => dest.ZIPPlus4, opt => opt.MapFrom(src => src.ZIPPlus4))
                    .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

                CreateMap<UspsAddressDto, AddressDto>()
                    .ConstructUsing(src => src.Address) // Use the Address property directly
                    .ForMember(dest => dest.StreetAddress, opt => opt.MapFrom(src => src.Address.StreetAddress))
                    .ForMember(dest => dest.SecondaryAddress, opt => opt.MapFrom(src => src.Address.SecondaryAddress))
                    .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.Address.City))
                    .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.Address.State.ToUpper()))
                    .ForMember(dest => dest.ZIPCode, opt => opt.MapFrom(src => src.Address.ZIPCode))
                    .ForMember(dest => dest.ZIPPlus4, opt => opt.MapFrom(src => src.Address.ZIPPlus4))
                    .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            }
        }
    }
}
