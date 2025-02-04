using System.Collections.Generic;
using AutoMapper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.ViewModels;

namespace Wedding.Abstractions.Mapping
{
    public class ViewModelToDtoMapping
    {
        public static IEnumerable<Profile> Profiles() => new List<Profile>
        {
            new FamilyUnitViewModelProfile(),
        };

        public class FamilyUnitViewModelProfile : Profile
        {
            public FamilyUnitViewModelProfile()
            {
                CreateMap<FamilyUnitViewModel, FamilyUnitDto>()
                    .ForMember(dest => dest.InvitationCode, opt => opt.MapFrom(src => src.InvitationCode))
                    .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.UnitName))
                    .ForMember(dest => dest.Tier, opt => opt.Ignore())
                    .ForMember(dest => dest.InvitationResponseNotes,
                        opt => opt.MapFrom(src => src.InvitationResponseNotes))
                    .ForMember(dest => dest.MailingAddress, opt => opt.MapFrom(src => src.MailingAddress))
                    .ForMember(dest => dest.AdditionalAddresses, opt => opt.MapFrom(src => src.AdditionalAddresses))
                    .ForMember(dest => dest.PotentialHeadCount, opt => opt.Ignore())
                    .ForMember(dest => dest.FamilyUnitLastLogin, opt => opt.MapFrom(src => src.FamilyUnitLastLogin))
                    .ForMember(dest => dest.Guests, opt => opt.MapFrom(src => src.Guests))
                    ;
                
                CreateMap<FamilyUnitDto, FamilyUnitViewModel>()
                    .ForMember(dest => dest.InvitationCode, opt => opt.MapFrom(src => src.InvitationCode))
                    .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.UnitName))
                    .ForMember(dest => dest.InvitationResponseNotes,
                        opt => opt.MapFrom(src => src.InvitationResponseNotes))
                    .ForMember(dest => dest.MailingAddress, opt => opt.MapFrom(src => src.MailingAddress))
                    .ForMember(dest => dest.FamilyUnitLastLogin, opt => opt.MapFrom(src => src.FamilyUnitLastLogin))
                    .ForMember(dest => dest.Guests, opt => opt.MapFrom(src => src.Guests))
                    ;
            }
        }
    }
}
