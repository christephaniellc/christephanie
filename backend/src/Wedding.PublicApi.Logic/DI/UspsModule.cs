using Autofac;
using Wedding.Common.Web.Options;
using Wedding.PublicApi.Logic.Services;

namespace Wedding.PublicApi.Logic.DI
{
    public class UspsModule : Module
    {
        private readonly UspsOptions _uspsOptions;

        public UspsModule(UspsOptions uspsOptions)
        {
            _uspsOptions = uspsOptions;
        }

        /// <inheritdoc cref="Module"/>
        protected override void Load(ContainerBuilder builder)
        {
            builder.Register(_ =>
                {
                    return new MailingAddressValidationProvider(_uspsOptions.UserId, _uspsOptions.ApiUrl);
                })
                .AsImplementedInterfaces()
                .AsSelf()
                .SingleInstance();
        }
    }
}
