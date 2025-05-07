using System.Collections.Generic;
using AutoMapper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;

namespace Wedding.Abstractions.Mapping
{
    public class NotificationDataToDtoMapping
    {
        /// <summary>
        /// Mappings between dynamo and DTOs
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<Profile> Profiles() => new List<Profile>
        {
            new NotificationDataProfile()
        };

        public class NotificationDataProfile : Profile
        {
            public NotificationDataProfile()
            {
                CreateMap<NotificationDataEntity, GuestEmailLogDto>()
                    .ForMember(dest => dest.GuestEmailLogId, opt => opt.MapFrom(src => src.GuestEmailLogId))
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.EmailType, opt => opt.MapFrom(src => src.EmailType!.Value))
                    .ForMember(dest => dest.CampaignId, opt => opt.MapFrom(src => src.CampaignId))
                    .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => src.Timestamp))
                    .ForMember(dest => dest.DeliveryStatus, opt => opt.MapFrom(src => src.DeliveryStatus))
                    .ForMember(dest => dest.EmailAddress, opt => opt.MapFrom(src => src.EmailAddress))
                    .ForMember(dest => dest.Verified, opt => opt.MapFrom(src => src.Verified))
                    .ForMember(dest => dest.Metadata, opt => opt.MapFrom(src => src.Metadata));

                CreateMap<GuestEmailLogDto, NotificationDataEntity>()
                    .ForMember(dest => dest.PartitionKey, opt => opt.MapFrom(src => $"{DynamoKeys.NotificationKeys.GetPartitionKey(src.GuestId)}"))
                    .ForMember(dest => dest.SortKey, opt => opt.MapFrom(src => $"{DynamoKeys.NotificationKeys.GetSortKey(src.Timestamp, src.EmailType)}"))

                    .ForMember(dest => dest.CampaignIndexPartitionKey, opt => opt.MapFrom(src => $"{DynamoKeys.NotificationKeys.GetCampaignIdGSI(src.CampaignId)}"))
                    .ForMember(dest => dest.CampaignIndexSortKey, opt => opt.MapFrom(src => $"{DynamoKeys.Guest}#{src.GuestId}"))

                    .ForMember(dest => dest.GuestEmailLogId, opt => opt.MapFrom(src => src.GuestEmailLogId))
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.EmailType, opt => opt.MapFrom(src => src.EmailType))
                    .ForMember(dest => dest.CampaignId, opt => opt.MapFrom(src => src.CampaignId))
                    .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => src.Timestamp))
                    .ForMember(dest => dest.DeliveryStatus, opt => opt.MapFrom(src => src.DeliveryStatus))
                    .ForMember(dest => dest.EmailAddress, opt => opt.MapFrom(src => src.EmailAddress))
                    .ForMember(dest => dest.Verified, opt => opt.MapFrom(src => src.Verified))
                    .ForMember(dest => dest.Metadata, opt => opt.MapFrom(src => src.Metadata));
            }
        }
    }
}
