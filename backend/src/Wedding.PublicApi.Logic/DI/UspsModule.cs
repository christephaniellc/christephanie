using Autofac;
using Microsoft.Extensions.Logging;
using Wedding.Common.Configuration;
using Wedding.Common.ThirdParty;

namespace Wedding.PublicApi.Logic.DI
{
    public class UspsModule : Module
    {
        private readonly UspsConfiguration _uspsConfiguration;

        public UspsModule(UspsConfiguration uspsConfiguration)
        {
            _uspsConfiguration = uspsConfiguration;
        }

        /// <inheritdoc cref="Module"/>
        protected override void Load(ContainerBuilder builder)
        {
            builder.Register(context =>
            {
                var logger = context.Resolve<ILogger<UspsMailingAddressValidationProvider>>();

                return new UspsMailingAddressValidationProvider(logger, _uspsConfiguration.ApiUrl, 
                        _uspsConfiguration.ConsumerKey, _uspsConfiguration.ConsumerSecret);
                })
                .AsImplementedInterfaces()
                .AsSelf()
                .SingleInstance();
        }
    }
}
