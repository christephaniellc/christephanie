using System.Collections.Generic;
using AutoMapper;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;

namespace Wedding.Abstractions.Mapping
{
    public class PaymentEntityToDtoMapping
    {
        /// <summary>
        /// Mappings between dynamo and DTOs
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<Profile> Profiles() => new List<Profile>
        {
            new PaymentProfile()
        };

        public class PaymentProfile : Profile
        {
            public PaymentProfile()
            {
                CreateMap<PaymentIntentEntity, ContributionDto>()
                    .ForMember(dest => dest.PaymentIntentId, opt => opt.MapFrom(src => src.PaymentIntentId))
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => (int)src.Amount)) // Cast long to int for DTO
                    .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Currency))
                    .ForMember(dest => dest.GiftCategory, opt => opt.MapFrom(src => src.GiftCategory))
                    .ForMember(dest => dest.GiftNotes, opt => opt.MapFrom(src => src.GiftNotes))
                    .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src => src.GuestName))
                    .ForMember(dest => dest.IsAnonymous, opt => opt.MapFrom(src => src.IsAnonymous))
                    .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => src.Timestamp));

                CreateMap<ContributionDto, PaymentIntentEntity>()
                    .ForMember(dest => dest.PartitionKey, opt => opt.MapFrom(src => $"{DynamoKeys.PaymentKeys.GetPartitionKey(src.PaymentIntentId)}"))
                    .ForMember(dest => dest.SortKey, opt => opt.MapFrom(src => $"{DynamoKeys.PaymentKeys.GetSortKey(src.Timestamp)}"))
                    .ForMember(dest => dest.PaymentIntentId, opt => opt.MapFrom(src => src.PaymentIntentId))
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => (long)src.Amount)) // Cast int to long
                    .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Currency))
                    .ForMember(dest => dest.GiftCategory, opt => opt.MapFrom(src => src.GiftCategory))
                    .ForMember(dest => dest.GiftNotes, opt => opt.MapFrom(src => src.GiftNotes))
                    .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src => src.GuestName))
                    .ForMember(dest => dest.IsAnonymous, opt => opt.MapFrom(src => src.IsAnonymous))
                    .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => src.Timestamp))
                    .ForMember(dest => dest.GuestIdGSI, opt => opt.MapFrom(src => $"{DynamoKeys.PaymentKeys.GetGuestIdGSI(src.GuestId)}"))
                    .ForMember(dest => dest.GuestSortKey, opt => opt.MapFrom(src => src.Timestamp))
                    .ForMember(dest => dest.GiftCategoryGSI, opt => opt.MapFrom(src => $"{DynamoKeys.PaymentKeys.GetGiftCategoryGSI(src.GiftCategory)}"))
                    .ForMember(dest => dest.CategorySortKey, opt => opt.MapFrom(src => src.Timestamp));
            }
        }
    }
}
