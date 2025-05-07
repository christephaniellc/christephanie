using AutoMapper;

namespace Wedding.Abstractions.Mapping
{
    public static class MappingProfileHelper
    {
        public static IMapper GetMapper()
        {
            var config = AddAllProfiles();
            return config.CreateMapper();
        }

        public static MapperConfiguration AddAllProfiles()
        {
            return new MapperConfiguration(cfg =>
            {
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
                cfg.AddProfiles(DesignConfigurationEntityToDtoMapping.Profiles());
                cfg.AddProfiles(PaymentEntityToDtoMapping.Profiles());
                cfg.AddProfiles(NotificationDataToDtoMapping.Profiles());
            });
        }
    }
}
