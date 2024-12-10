using AutoMapper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;

namespace Wedding.Abstractions.Mapping
{
    public class WeddingEntityMappingProfile : Profile
    {
        public WeddingEntityMappingProfile()
        {
            CreateMap<WeddingEntity, FamilyUnitDto>()
                .ForMember(dest => dest.RsvpCode, opt => opt.MapFrom(src => src.RsvpCode))
                .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.UnitName))
                .ForMember(dest => dest.Tier, opt => opt.MapFrom(src => src.Tier))
                .ForMember(dest => dest.InvitationResponseNotes, opt => opt.MapFrom(src => src.InvitationResponseNotes))
                .ForMember(dest => dest.MailingAddress, opt => opt.MapFrom(src => src.MailingAddress))
                .ForMember(dest => dest.AdditionalAddresses, opt => opt.MapFrom(src => src.AdditionalAddresses))
                .ForMember(dest => dest.PotentialHeadCount, opt => opt.MapFrom(src => src.PotentialHeadCount ?? 0))
                .ForMember(dest => dest.FamilyUnitLastLogin, opt => opt.MapFrom(src => src.FamilyUnitLastLogin))
                .ForMember(dest => dest.Guests, opt => opt.Ignore()); // We'll manually map Guests

            CreateMap<WeddingEntity, GuestDto>()
                .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                .ForMember(dest => dest.Auth0Id, opt => opt.MapFrom(src => src.Auth0Id))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.Roles))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.AgeGroup, opt => opt.MapFrom(src => src.AgeGroup ?? AgeGroupEnum.Adult))
                .ForMember(dest => dest.RsvpNotes, opt => opt.MapFrom(src => src.InvitationResponseNotes)) // Assuming RSVP Notes map here
                .ForMember(dest => dest.Rsvp, opt => opt.Ignore()) // We'll manually map Rsvps
                .ForMember(dest => dest.Preferences, opt => opt.Ignore()) // We'll manually map Preferences
                .ForMember(dest => dest.GuestLastLogin, opt => opt.MapFrom(src => src.GuestLastLogin));

            CreateMap<WeddingEntity, RsvpDto>()
                .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                .ForMember(dest => dest.InvitationResponse, opt => opt.MapFrom(src => src.InvitationResponse))
                .ForMember(dest => dest.Wedding, opt => opt.MapFrom(src => src.RsvpWedding))
                .ForMember(dest => dest.SleepPreference, opt => opt.MapFrom(src => src.SleepPreference))
                .ForMember(dest => dest.RehearsalDinner, opt => opt.MapFrom(src => src.RsvpRehearsalDinner))
                .ForMember(dest => dest.FourthOfJuly, opt => opt.MapFrom(src => src.RsvpFourthOfJuly))
                .ForMember(dest => dest.BuildWeek, opt => opt.MapFrom(src => src.RsvpBuildWeek))
                .ForMember(dest => dest.ArrivalDate, opt => opt.MapFrom(src => src.ArrivalDate));

            CreateMap<WeddingEntity, PreferencesDto>()
                .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                .ForMember(dest => dest.Meal, opt => opt.MapFrom(src => src.PrefMeal))
                .ForMember(dest => dest.KidsPortion, opt => opt.MapFrom(src => src.PrefKidsPortion))
                .ForMember(dest => dest.FoodAllergies, opt => opt.MapFrom(src => src.PrefFoodAllergies))
                .ForMember(dest => dest.SpecialAlcoholRequests, opt => opt.MapFrom(src => src.PrefSpecialAlcoholRequests));
        }
    }
}
