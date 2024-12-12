using Autofac;
using Wedding.Common.Configuration;
using Wedding.Common.Web.Options;
using Wedding.PublicApi.Logic.Services;

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
            builder.Register(_ =>
                {
                    return new MailingAddressValidationProvider(_uspsConfiguration.UserId, _uspsConfiguration.ApiUrl);
                })
                .AsImplementedInterfaces()
                .AsSelf()
                .SingleInstance();
        }
    }
}
