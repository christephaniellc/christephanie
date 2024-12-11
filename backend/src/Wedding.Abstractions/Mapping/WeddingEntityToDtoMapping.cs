using System.Collections.Generic;
using System.Xml.Serialization;
using AutoMapper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;

namespace Wedding.Abstractions.Mapping
{
    public class WeddingEntityToDtoMapping
    {
        /// <summary>
        /// Profiles required for mothership/shell communication with serializable messages over the bus
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<Profile> Profiles() => new List<Profile>
        {
            new FamilyUnitProfile(),
            new GuestProfile(),
            new RsvpProfile(),
            new PreferencesProfile(),
        };

        public class FamilyUnitProfile : Profile
        {
            public FamilyUnitProfile()
            {
                /// <summary>
                /// Pulls family unit from database record
                /// </summary>
                CreateMap<WeddingEntity, FamilyUnitDto>()
                    .ForMember(dest => dest.RsvpCode, opt => opt.MapFrom(src => src.RsvpCode))
                    .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.UnitName))
                    .ForMember(dest => dest.Tier, opt => opt.MapFrom(src => src.Tier))
                    .ForMember(dest => dest.InvitationResponseNotes,
                        opt => opt.MapFrom(src => src.InvitationResponseNotes))
                    .ForMember(dest => dest.MailingAddress, opt => opt.MapFrom(src => src.MailingAddress))
                    .ForMember(dest => dest.AdditionalAddresses, opt => opt.MapFrom(src => src.AdditionalAddresses))
                    .ForMember(dest => dest.PotentialHeadCount, opt => opt.MapFrom(src => src.PotentialHeadCount ?? 0))
                    .ForMember(dest => dest.FamilyUnitLastLogin, opt => opt.MapFrom(src => src.FamilyUnitLastLogin))
                    .ForMember(dest => dest.Guests, opt => opt.Ignore()) // We'll manually map Guests
                    ;

                /// <summary>
                /// Creates database record from family
                /// </summary>
                CreateMap<FamilyUnitDto, WeddingEntity>()
                    .ForMember(dest => dest.PartitionKey, opt => opt.MapFrom(src => DynamoKeys.GetFamilyUnitPartitionKey(src.RsvpCode)))
                    .ForMember(dest => dest.SortKey, opt => opt.MapFrom(src => DynamoKeys.GetFamilyInfoSortKey()))
                    .ForMember(dest => dest.RsvpCode, opt => opt.MapFrom(src => src.RsvpCode))
                    .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.UnitName))
                    .ForMember(dest => dest.Tier, opt => opt.MapFrom(src => src.Tier))
                    .ForMember(dest => dest.InvitationResponseNotes,
                        opt => opt.MapFrom(src => src.InvitationResponseNotes))
                    .ForMember(dest => dest.MailingAddress, opt => opt.MapFrom(src => src.MailingAddress))
                    .ForMember(dest => dest.AdditionalAddresses, opt => opt.MapFrom(src => src.AdditionalAddresses))
                    .ForMember(dest => dest.PotentialHeadCount, opt => opt.MapFrom(src => src.Guests != null ? src.Guests.Count : 0))
                    .ForMember(dest => dest.FamilyUnitLastLogin, opt => opt.MapFrom(src => src.FamilyUnitLastLogin))
                    ;
            }
        }

        public class GuestProfile : Profile
        {
            public GuestProfile()
            {
                /// <summary>
                /// Pulls family unit from database record
                /// </summary>
                CreateMap<WeddingEntity, GuestDto>()
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.GuestNumber, opt => opt.MapFrom(src => src.GuestNumber))
                    .ForMember(dest => dest.Auth0Id, opt => opt.MapFrom(src => src.Auth0Id))
                    .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                    .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                    .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.Roles))
                    .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                    .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                    .ForMember(dest => dest.AgeGroup, opt => opt.MapFrom(src => src.AgeGroup ?? AgeGroupEnum.Adult))
                    .ForMember(dest => dest.GuestLastLogin, opt => opt.MapFrom(src => src.GuestLastLogin))
                    .ForMember(dest => dest.Rsvp, opt => 
                        opt.MapFrom(src => new RsvpDto
                    {
                        InvitationResponse = src.InvitationResponse,
                        Wedding = src.RsvpWedding,
                        SleepPreference = src.SleepPreference,
                        RehearsalDinner = src.RsvpRehearsalDinner,
                        FourthOfJuly = src.RsvpFourthOfJuly,
                        BuildWeek = src.RsvpBuildWeek,
                        ArrivalDate = src.ArrivalDate,
                        RsvpNotes = src.RsvpNotes
                    }))
                    .ForMember(dest => dest.Preferences, opt => 
                        opt.MapFrom(src => new PreferencesDto
                    {
                        Meal = src.PrefMeal,
                        KidsPortion = src.PrefKidsPortion,
                        FoodAllergies = src.PrefFoodAllergies,
                        SpecialAlcoholRequests = src.PrefSpecialAlcoholRequests
                    }))
                    ;

                /// <summary>
                /// Creates database record from family
                /// </summary>
                CreateMap<GuestDto, WeddingEntity>()
                    .ForMember(dest => dest.PartitionKey, opt => opt.MapFrom(src => DynamoKeys.GetGuestPartitionKey(src.RsvpCode)))
                    .ForMember(dest => dest.SortKey, opt => opt.MapFrom(src => DynamoKeys.GetGuestSortKey(src.GuestId)))
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.GuestNumber, opt => opt.MapFrom(src => src.GuestNumber))
                    .ForMember(dest => dest.Auth0Id, opt => opt.MapFrom(src => src.Auth0Id))
                    .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                    .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                    .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.Roles))
                    .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                    .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                    .ForMember(dest => dest.AgeGroup, opt => opt.MapFrom(src => src.AgeGroup))
                    .ForMember(dest => dest.GuestLastLogin, opt => opt.MapFrom(src => src.GuestLastLogin))

                    .ForMember(dest => dest.InvitationResponse, opt => opt.MapFrom(src => src.Rsvp.InvitationResponse))
                    .ForMember(dest => dest.RsvpWedding, opt => opt.MapFrom(src => src.Rsvp.Wedding))
                    .ForMember(dest => dest.SleepPreference, opt => opt.MapFrom(src => src.Rsvp.SleepPreference))
                    .ForMember(dest => dest.RsvpRehearsalDinner, opt => opt.MapFrom(src => src.Rsvp.RehearsalDinner))
                    .ForMember(dest => dest.RsvpFourthOfJuly, opt => opt.MapFrom(src => src.Rsvp.FourthOfJuly))
                    .ForMember(dest => dest.RsvpBuildWeek, opt => opt.MapFrom(src => src.Rsvp.BuildWeek))
                    .ForMember(dest => dest.ArrivalDate, opt => opt.MapFrom(src => src.Rsvp.ArrivalDate))
                    
                    .ForMember(dest => dest.PrefMeal, opt => opt.MapFrom(src => src.Preferences.Meal))
                    .ForMember(dest => dest.PrefKidsPortion, opt => opt.MapFrom(src => src.Preferences.KidsPortion))
                    .ForMember(dest => dest.PrefFoodAllergies, opt => opt.MapFrom(src => src.Preferences.FoodAllergies))
                    .ForMember(dest => dest.PrefSpecialAlcoholRequests, opt => opt.MapFrom(src => src.Preferences.SpecialAlcoholRequests))
                    ;
            }
        }

        public class RsvpProfile : Profile
        {
            public RsvpProfile()
            {
                CreateMap<WeddingEntity, RsvpDto>()
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.InvitationResponse, opt => opt.MapFrom(src => src.InvitationResponse))
                    .ForMember(dest => dest.Wedding, opt => opt.MapFrom(src => src.RsvpWedding))
                    .ForMember(dest => dest.SleepPreference, opt => opt.MapFrom(src => src.SleepPreference))
                    .ForMember(dest => dest.RehearsalDinner, opt => opt.MapFrom(src => src.RsvpRehearsalDinner))
                    .ForMember(dest => dest.FourthOfJuly, opt => opt.MapFrom(src => src.RsvpFourthOfJuly))
                    .ForMember(dest => dest.BuildWeek, opt => opt.MapFrom(src => src.RsvpBuildWeek))
                    .ForMember(dest => dest.ArrivalDate, opt => opt.MapFrom(src => src.ArrivalDate))
                    .ForMember(dest => dest.RsvpNotes, opt => opt.MapFrom(src => src.RsvpNotes))
                    ;

                CreateMap<RsvpDto, WeddingEntity>()
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.InvitationResponse, opt => opt.MapFrom(src => src.InvitationResponse))
                    .ForMember(dest => dest.RsvpWedding, opt => opt.MapFrom(src => src.Wedding))
                    .ForMember(dest => dest.SleepPreference, opt => opt.MapFrom(src => src.SleepPreference))
                    .ForMember(dest => dest.RsvpRehearsalDinner, opt => opt.MapFrom(src => src.RehearsalDinner))
                    .ForMember(dest => dest.RsvpFourthOfJuly, opt => opt.MapFrom(src => src.FourthOfJuly))
                    .ForMember(dest => dest.RsvpBuildWeek, opt => opt.MapFrom(src => src.BuildWeek))
                    .ForMember(dest => dest.ArrivalDate, opt => opt.MapFrom(src => src.ArrivalDate))
                    .ForMember(dest => dest.RsvpNotes, opt => opt.MapFrom(src => src.RsvpNotes))
                    ;
            }
        }

        public class PreferencesProfile : Profile
        {
            public PreferencesProfile()
            {
                CreateMap<WeddingEntity, PreferencesDto>()
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.Meal, opt => opt.MapFrom(src => src.PrefMeal))
                    .ForMember(dest => dest.KidsPortion, opt => opt.MapFrom(src => src.PrefKidsPortion))
                    .ForMember(dest => dest.FoodAllergies, opt => opt.MapFrom(src => src.PrefFoodAllergies))
                    .ForMember(dest => dest.SpecialAlcoholRequests,
                        opt => opt.MapFrom(src => src.PrefSpecialAlcoholRequests))
                    ;

                CreateMap<PreferencesDto, WeddingEntity>()
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.PrefMeal, opt => opt.MapFrom(src => src.Meal))
                    .ForMember(dest => dest.PrefKidsPortion, opt => opt.MapFrom(src => src.KidsPortion))
                    .ForMember(dest => dest.PrefFoodAllergies, opt => opt.MapFrom(src => src.FoodAllergies))
                    .ForMember(dest => dest.PrefSpecialAlcoholRequests,
                        opt => opt.MapFrom(src => src.SpecialAlcoholRequests))
                    ;
            }
        }
    }
}
