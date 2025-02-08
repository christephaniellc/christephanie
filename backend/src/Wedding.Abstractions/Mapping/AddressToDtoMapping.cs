using System;
using System.Text.Json;
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
                // CreateMap<string, AddressDto>()
                //     .ConstructUsing((addressString, context) =>
                //     {
                //         if (string.IsNullOrWhiteSpace(addressString))
                //         {
                //             throw new AutoMapperMappingException("Input string cannot be null or empty");
                //         }
                //
                //         var parts = addressString.Split(new[] { "\r\n", "\n", "," }, StringSplitOptions.RemoveEmptyEntries);
                //
                //         return new AddressDto
                //         {
                //             StreetAddress = parts.Length > 0 ? parts[0].Trim() : null,
                //             SecondaryAddress = parts.Length > 1 ? parts[1].Trim() : null,
                //             City = parts.Length > 2 ? parts[2].Trim() : null,
                //             State = parts.Length > 3 ? parts[3].Trim() : null,
                //             ZIPCode = parts.Length > 4 ? parts[4].Trim() : null,
                //             Country = parts.Length > 5 ? parts[5].Trim() : null
                //         };
                //     });

                CreateMap<string, AddressDto?>()
                    .ConstructUsing((addressString, context) =>
                {
                    if (string.IsNullOrWhiteSpace(addressString))
                    {
                        throw new AutoMapperMappingException("Input string cannot be null or empty");
                    }
                    return JsonSerializer.Deserialize<AddressDto?>(addressString) ?? null;
                });

                CreateMap<AddressDto, UspsAddressDto>()
                    .ForPath(dest => dest.Address!.StreetAddress, opt => opt.MapFrom(src => src.StreetAddress))
                    .ForPath(dest => dest.Address!.SecondaryAddress, opt => opt.MapFrom(src => src.SecondaryAddress))
                    .ForPath(dest => dest.Address!.City, opt => opt.MapFrom(src => src.City))
                    .ForPath(dest => dest.Address!.State, opt => opt.MapFrom(src => (src.State != null) ? src.State.ToUpper() : null))
                    .ForPath(dest => dest.Address!.ZIPCode, opt => opt.MapFrom(src => src.ZIPCode))
                    .ForPath(dest => dest.Address!.ZIPPlus4, opt => opt.MapFrom(src => src.ZIPPlus4))
                    .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

                // CreateMap<AddressDto, UspsAddressDto>()
                //     .ForMember(dest => dest.Address.StreetAddress, opt => opt.MapFrom(src => src.StreetAddress))
                //     .ForMember(dest => dest.Address.SecondaryAddress, opt => opt.MapFrom(src => src.SecondaryAddress))
                //     .ForMember(dest => dest.Address.City, opt => opt.MapFrom(src => src.City))
                //     .ForMember(dest => dest.Address.State, opt => opt.MapFrom(src => src.State.ToUpper()))
                //     .ForMember(dest => dest.Address.ZIPCode, opt => opt.MapFrom(src => src.ZIPCode))
                //     .ForMember(dest => dest.Address.ZIPPlus4, opt => opt.MapFrom(src => src.ZIPPlus4))
                //     .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

                CreateMap<UspsAddressDto, AddressDto>()
                    .ConstructUsing(src => src.Address ?? new AddressDto())
                    .ForMember(dest => dest.StreetAddress, opt => opt.MapFrom(src => src.Address!.StreetAddress))
                    .ForMember(dest => dest.SecondaryAddress, opt => opt.MapFrom(src => src.Address!.SecondaryAddress))
                    .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.Address!.City))
                    .ForMember(dest => dest.State, opt => opt.MapFrom(src => (src.Address!.State != null) ? src.Address!.State.ToUpper() : null))
                    .ForMember(dest => dest.ZIPCode, opt => opt.MapFrom(src => src.Address!.ZIPCode))
                    .ForMember(dest => dest.ZIPPlus4, opt => opt.MapFrom(src => src.Address!.ZIPPlus4))
                    .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            }
        }
    }
}
