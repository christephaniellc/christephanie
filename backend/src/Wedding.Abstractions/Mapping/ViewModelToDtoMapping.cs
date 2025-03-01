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
            new GuestViewModelProfile()
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

        public class GuestViewModelProfile : Profile
        {
            public GuestViewModelProfile()
            {
                CreateMap<GuestDto, GuestViewModel>()
                    .ForMember(dest => dest.InvitationCode, opt => opt.MapFrom(src => src.InvitationCode))
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.GuestNumber, opt => opt.MapFrom(src => src.GuestNumber))
                    .ForMember(dest => dest.Auth0Id, opt => opt.MapFrom(src => src.Auth0Id))
                    .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                    .ForMember(dest => dest.AdditionalFirstNames, opt => opt.MapFrom(src => src.AdditionalFirstNames))
                    .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                    .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.Roles))
                    .ForMember(dest => dest.Email, opt => opt.MapFrom(src =>
                        src.Email == null || string.IsNullOrEmpty(src.Email.Value)
                            ? null
                            : new MaskedVerifiedModel
                            {
                                MaskedValue = ObfuscationHelper.MaskEmail(src.Email.Value),
                                Verified = src.Email.Verified
                            }
                    ))
                    .ForMember(dest => dest.Phone, opt => opt.MapFrom(src =>
                        src.Phone == null || string.IsNullOrEmpty(src.Phone.Value)
                            ? null
                            : new MaskedVerifiedModel
                            {
                                MaskedValue = ObfuscationHelper.MaskPhone(src.Phone.Value),
                                Verified = src.Phone.Verified
                            }
                    ))
                    .ForMember(dest => dest.Rsvp, opt => opt.MapFrom(src => src.Rsvp))
                    .ForMember(dest => dest.Preferences, opt => opt.MapFrom(src => src.Preferences))
                    .ForMember(dest => dest.AgeGroup, opt => opt.MapFrom(src => src.AgeGroup))
                    .ForMember(dest => dest.LastActivity, opt => opt.MapFrom(src => src.LastActivity));
            }
        }
    }
}
