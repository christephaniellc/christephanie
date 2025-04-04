using System.Collections.Generic;
using System.Text.Json;
using AutoMapper;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;

namespace Wedding.Abstractions.Mapping
{
    public class DesignConfigurationEntityToDtoMapping
    {
        /// <summary>
        /// Mappings between dynamo and DTOs
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<Profile> Profiles() => new List<Profile>
        {
            new InvitationDesignProfile()
        };

        public class InvitationDesignProfile : Profile
        {
            public InvitationDesignProfile()
            {
                /// <summary>
                /// Pulls design configuration from database record
                /// </summary>
                CreateMap<DesignConfigurationEntity, InvitationDesignDto>()
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.DesignId, opt => opt.MapFrom(src => src.DesignId))
                    .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                    .ForMember(dest => dest.DateCreated, opt =>
                    {
                        opt.Condition(src => !string.IsNullOrEmpty(src.DateCreated));
                        opt.MapFrom((src, dest, destMember, context) =>
                            !string.IsNullOrEmpty(src.DateCreated)
                                ? JsonSerializer.Deserialize<LastUpdateAuditDto>(src.DateCreated!,
                                    new JsonSerializerOptions())
                                : null);
                    })
                    .ForMember(dest => dest.DateUpdated, opt =>
                    {
                        opt.Condition(src => !string.IsNullOrEmpty(src.DateUpdated));
                        opt.MapFrom((src, dest, destMember, context) =>
                            !string.IsNullOrEmpty(src.DateUpdated)
                                ? JsonSerializer.Deserialize<LastUpdateAuditDto>(src.DateUpdated!,
                                    new JsonSerializerOptions())
                                : null);
                    })
                    .ForMember(dest => dest.Orientation, opt => opt.Ignore())
                    .ForMember(dest => dest.SeparatorWidth, opt => opt.Ignore())
                    .ForMember(dest => dest.SeparatorColor, opt => opt.Ignore())
                    .ForMember(dest => dest.PhotoGridItems, opt => opt.Ignore())
                    .AfterMap((src, dest) =>
                    {
                        if (!string.IsNullOrEmpty(src.ConfigurationData))
                        {
                            var configDto = JsonSerializer.Deserialize<InvitationDesignDto>(src.ConfigurationData!);
                            if (configDto != null)
                            {
                                dest.Orientation = configDto.Orientation;
                                dest.SeparatorWidth = configDto.SeparatorWidth;
                                dest.SeparatorColor = configDto.SeparatorColor;
                                dest.PhotoGridItems = configDto.PhotoGridItems;
                            }
                        }
                    })
                    ;

                /// <summary>
                /// Creates database record from design configuration
                /// </summary>
                CreateMap<InvitationDesignDto, DesignConfigurationEntity>()
                    .ForMember(dest => dest.PartitionKey,
                        opt => opt.MapFrom(src => DynamoKeys.GetConfigurationPartitionKey(src.GuestId)))
                    .ForMember(dest => dest.SortKey, opt => opt.MapFrom(src => DynamoKeys.GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum.Invitation, src.DesignId)))
                    .ForMember(dest => dest.GuestId, opt => opt.MapFrom(src => src.GuestId))
                    .ForMember(dest => dest.DesignId, opt => opt.MapFrom(src => src.DesignId))
                    .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                    .ForMember(dest => dest.DateCreated,
                        opt => opt.MapFrom(src =>
                            src.DateCreated != null && src.DateCreated != null
                                ? src.DateCreated.ToString()
                                : null))
                    .ForMember(dest => dest.DateUpdated,
                        opt => opt.MapFrom(src =>
                            src.DateUpdated != null && src.DateUpdated != null
                                ? src.DateUpdated.ToString()
                                : null))
                    .ForMember(dest => dest.ConfigurationData,
                        opt => opt.MapFrom(src => (src != null) ? src.ToString() : null))
                    ;
            }
        }
    }
}
