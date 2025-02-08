using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
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
        /// 
        /// Profiles required for mothership/shell communication with serializable messages over the bus
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<Profile> Profiles() => new List<Profile>
        {
            new FamilyUnitProfile(),
            new GuestProfile(),
            new RsvpProfile(),
            new PreferencesProfile(),
            new VerifyProfile()
        };

        public class FamilyUnitProfile : Profile
        {
            public FamilyUnitProfile()
            {
                /// <summary>
                /// Pulls family unit from database record
                /// </summary>
                CreateMap<WeddingEntity, FamilyUnitDto>()
                    .ForMember(dest => dest.InvitationCode, opt => opt.MapFrom(src => src.InvitationCode))
                    .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.UnitName))
                    .ForMember(dest => dest.Tier, opt => opt.MapFrom(src => src.Tier))
                    .ForMember(dest => dest.InvitationResponseNotes,
                        opt => opt.MapFrom(src => src.InvitationResponseNotes))
                    .ForMember(dest => dest.MailingAddress, opt =>
                    {
                        opt.Condition(src => !string.IsNullOrEmpty(src.MailingAddress));
                        opt.MapFrom((src, dest, destMember, context) => !string.IsNullOrEmpty(src.MailingAddress) ?
                            JsonSerializer.Deserialize<AddressDto>(src.MailingAddress!, new JsonSerializerOptions()) : null);
                    })
                    .ForMember(dest => dest.AdditionalAddresses, opt =>
                    {
                        opt.Condition(src => src.AdditionalAddresses != null && src.AdditionalAddresses.Any());
                        opt.MapFrom((src, dest, destMember, context) => 
                            src.AdditionalAddresses?
                                .Select(address => !string.IsNullOrEmpty(address) ? JsonSerializer.Deserialize<AddressDto>(address, new JsonSerializerOptions()): null)
                                .ToList()
                        );
                    })
                    .ForMember(dest => dest.PotentialHeadCount, opt => opt.MapFrom(src => src.PotentialHeadCount ?? 0))
                    .ForMember(dest => dest.FamilyUnitLastLogin, opt => opt.MapFrom(src => src.FamilyUnitLastLogin))
                    .ForMember(dest => dest.Guests, opt => opt.Ignore()) // We'll manually map Guests
                    ;

                /// <summary>
                /// Creates database record from family
                /// </summary>
                CreateMap<FamilyUnitDto, WeddingEntity>()
                    .ForMember(dest => dest.PartitionKey, opt => opt.MapFrom(src => DynamoKeys.GetPartitionKey(src.InvitationCode)))
                    .ForMember(dest => dest.SortKey, opt => opt.MapFrom(src => DynamoKeys.GetFamilyInfoSortKey()))
                    .ForMember(dest => dest.InvitationCode, opt => opt.MapFrom(src => src.InvitationCode))
                    .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.UnitName))
                    .ForMember(dest => dest.Tier, opt => opt.MapFrom(src => src.Tier))
                    .ForMember(dest => dest.InvitationResponseNotes,
                        opt => opt.MapFrom(src => src.InvitationResponseNotes))
                    .ForMember(dest => dest.MailingAddress, opt => opt.MapFrom(src => (src.MailingAddress != null) ? src.MailingAddress.ToString() : null))
                    .ForMember(dest => dest.AdditionalAddresses, opt => opt.MapFrom(src => (src.AdditionalAddresses != null) ? src.AdditionalAddresses.Select(address => address.ToString()).ToList() : null))
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
                    .ForMember(dest => dest.AdditionalFirstNames, opt => opt.MapFrom(src => src.AdditionalFirstNames))
                    .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                    .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.Roles))
                    .ForMember(dest => dest.Email, opt => opt.MapFrom(src =>
                        string.IsNullOrWhiteSpace(src.Email)
                            ? new VerifiedDto()
                            : JsonSerializer.Deserialize<VerifiedDto?>(src.Email, new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true,
                                AllowTrailingCommas = true
                            })
                    ))
                    .ForMember(dest => dest.Phone, opt => opt.MapFrom(src =>
                        string.IsNullOrWhiteSpace(src.Phone)
                            ? new VerifiedDto()
                            : JsonSerializer.Deserialize<VerifiedDto?>(src.Phone, new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true,
                                AllowTrailingCommas = true
                            })
                    ))
                    .ForMember(dest => dest.AgeGroup, opt => opt.MapFrom(src => src.AgeGroup ?? AgeGroupEnum.Adult))
                    .ForMember(dest => dest.LastActivity, opt => opt.MapFrom(src => src.LastActivity))
                    .ForMember(dest => dest.Rsvp, opt => 
                        opt.MapFrom((src, dest, destMember, context) => context.Mapper.Map<RsvpDto>(src)))
                    .ForMember(dest => dest.Preferences, opt =>
                        opt.MapFrom((src, dest, destMember, context) => context.Mapper.Map<PreferencesDto>(src)))
                    ;

                /// <summary>
                /// Creates database record from family
                /// </summary>
                CreateMap<GuestDto, WeddingEntity>()
                    .ForMember(dest => dest.PartitionKey, opt => opt.MapFrom(src => DynamoKeys.GetPartitionKey(src.InvitationCode)))
                    .ForMember(dest => dest.SortKey, opt => opt.MapFrom(src => DynamoKeys.GetGuestSortKey(src.GuestId)))
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.GuestNumber, opt => opt.MapFrom(src => src.GuestNumber))
                    .ForMember(dest => dest.Auth0Id, opt => opt.MapFrom(src => src.Auth0Id))
                    .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                    .ForMember(dest => dest.AdditionalFirstNames, opt => opt.MapFrom(src => src.AdditionalFirstNames))
                    .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                    .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.Roles))
                    .ForMember(dest => dest.Email, opt => opt.MapFrom(src => (src.Email != null) ? src.Email.ToString() : null))
                    .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => (src.Phone != null) ? src.Phone.ToString() : null))
                    .ForMember(dest => dest.AgeGroup, opt => opt.MapFrom(src => src.AgeGroup))
                    .ForMember(dest => dest.LastActivity, opt => opt.MapFrom(src => src.LastActivity))

                    .ForMember(dest => dest.InvitationResponse, opt => opt.MapFrom(src => src.Rsvp != null ? src.Rsvp.InvitationResponse : InvitationResponseEnum.Pending))
                    .ForMember(dest => dest.RsvpWedding, opt => opt.MapFrom(src => src.Rsvp != null ? src.Rsvp.Wedding : null))
                    .ForMember(dest => dest.RsvpRehearsalDinner, opt => opt.MapFrom(src => src.Rsvp != null ? src.Rsvp.RehearsalDinner : null))
                    .ForMember(dest => dest.RsvpFourthOfJuly, opt => opt.MapFrom(src => src.Rsvp != null ? src.Rsvp.FourthOfJuly : null))
                    .ForMember(dest => dest.InvitationResponseAudit, opt => opt.MapFrom(src => src.Rsvp != null && src.Rsvp.InvitationResponseAudit != null ? src.Rsvp.InvitationResponseAudit.ToString() : null))
                    .ForMember(dest => dest.RsvpAudit, opt => opt.MapFrom(src => src.Rsvp != null && src.Rsvp.RsvpAudit != null ? src.Rsvp.RsvpAudit.ToString() : null))

                    .ForMember(dest => dest.PrefSleep, opt => opt.MapFrom(src => src.Preferences != null ? src.Preferences.SleepPreference : null))
                    .ForMember(dest => dest.PrefFood, opt => opt.MapFrom(src => src.Preferences != null ? src.Preferences.FoodPreference : null))
                    .ForMember(dest => dest.PrefFoodAllergies, opt => opt.MapFrom(src => src.Preferences != null ? src.Preferences.FoodAllergies : null))
                    .ForMember(dest => dest.PrefNotification, opt => opt.MapFrom(src => src.Preferences != null ? src.Preferences.NotificationPreference : null))
                    ;
            }
        }

        public class RsvpProfile : Profile
        {
            public RsvpProfile()
            {
                CreateMap<WeddingEntity, RsvpDto>()
                    .ForMember(dest => dest.InvitationResponse, opt => opt.MapFrom(src => src.InvitationResponse))
                    .ForMember(dest => dest.Wedding, opt => opt.MapFrom(src => src.RsvpWedding))
                    .ForMember(dest => dest.RehearsalDinner, opt => opt.MapFrom(src => src.RsvpRehearsalDinner))
                    .ForMember(dest => dest.FourthOfJuly, opt => opt.MapFrom(src => src.RsvpFourthOfJuly))
                    .ForMember(dest => dest.RsvpNotes, opt => opt.MapFrom(src => src.RsvpNotes))
                    .ForMember(dest => dest.InvitationResponseAudit, opt =>
                    {
                        opt.Condition(src => !string.IsNullOrEmpty(src.InvitationResponseAudit));
                        opt.MapFrom((src, dest, destMember, context) => !string.IsNullOrEmpty(src.InvitationResponseAudit) ?
                            JsonSerializer.Deserialize<LastUpdateAuditDto>(src.InvitationResponseAudit!, new JsonSerializerOptions()) : null);
                    })
                    .ForMember(dest => dest.RsvpAudit, opt =>
                    {
                        opt.Condition(src => !string.IsNullOrEmpty(src.RsvpAudit));
                        opt.MapFrom((src, dest, destMember, context) => !string.IsNullOrEmpty(src.RsvpAudit) ?
                            JsonSerializer.Deserialize<LastUpdateAuditDto>(src.RsvpAudit!, new JsonSerializerOptions()) : null);
                    })
                    ;

                CreateMap<RsvpDto, WeddingEntity>()
                    .ForMember(dest => dest.InvitationResponse, opt => opt.MapFrom(src => src.InvitationResponse))
                    .ForMember(dest => dest.RsvpWedding, opt => opt.MapFrom(src => src.Wedding))
                    .ForMember(dest => dest.RsvpRehearsalDinner, opt => opt.MapFrom(src => src.RehearsalDinner))
                    .ForMember(dest => dest.RsvpFourthOfJuly, opt => opt.MapFrom(src => src.FourthOfJuly))
                    .ForMember(dest => dest.RsvpNotes, opt => opt.MapFrom(src => src.RsvpNotes))
                    .ForMember(dest => dest.InvitationResponseAudit, opt => opt.MapFrom(src => src.InvitationResponseAudit != null ? src.InvitationResponseAudit.ToString() : null))
                    .ForMember(dest => dest.RsvpAudit, opt => opt.MapFrom(src => src.RsvpAudit != null ? src.RsvpAudit.ToString() : null))
                    ;
            }
        }

        public class PreferencesProfile : Profile
        {
            public PreferencesProfile()
            {
                CreateMap<WeddingEntity, PreferencesDto>()
                    .ForMember(dest => dest.NotificationPreference, opt => opt.MapFrom(src =>
                        src.PrefNotification != null
                            ? src.PrefNotification.ToList()
                            : new List<NotificationPreferenceEnum>()))
                    .ForMember(dest => dest.SleepPreference, opt => opt.MapFrom(src => src.PrefSleep))
                    .ForMember(dest => dest.FoodPreference, opt => opt.MapFrom(src => src.PrefFood))
                    .ForMember(dest => dest.FoodAllergies, opt => opt.MapFrom(src => src.PrefFoodAllergies))
                    ;

                CreateMap<PreferencesDto, WeddingEntity>()
                    .ForMember(dest => dest.PrefNotification, opt => opt.MapFrom(src =>
                        src.NotificationPreference != null
                            ? src.NotificationPreference.ToList() // Ensures correct List<Enum> handling
                            : new List<NotificationPreferenceEnum>()))
                    .ForMember(dest => dest.PrefSleep, opt => opt.MapFrom(src => src.SleepPreference))
                    .ForMember(dest => dest.PrefFood, opt => opt.MapFrom(src => src.FoodPreference))
                    .ForMember(dest => dest.PrefFoodAllergies, opt => opt.MapFrom(src => src.FoodAllergies))
                    ;
            }
        }

        public class VerifyProfile : Profile
        {
            public VerifyProfile()
            {
                CreateMap<string, VerifiedDto?>()
                    .ConvertUsing(verifyString =>
                        string.IsNullOrWhiteSpace(verifyString)
                            ? null
                            : JsonSerializer.Deserialize<VerifiedDto>(verifyString, new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true,
                                AllowTrailingCommas = true
                            }));

                CreateMap<VerifiedDto, string?>()
                    .ConvertUsing(verifyDto => verifyDto != null
                        ? JsonSerializer.Serialize(verifyDto, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true,
                            AllowTrailingCommas = true
                        })
                        : null);
            }
        }
    }
}
