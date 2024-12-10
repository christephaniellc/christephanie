using System.Diagnostics.CodeAnalysis;
using Autofac;
using Wedding.PublicApi.Logic.Services;

namespace Wedding.PublicApi.Logic.DI
{
    [ExcludeFromCodeCoverage]
    public class AuthModule : Module
    {
        private readonly string _baseUrl;

        public AuthModule(string baseUrl)
        {
            _baseUrl = baseUrl;
        }
        
        /// <inheritdoc cref="Module"/>
        protected override void Load(ContainerBuilder builder)
        {
            builder.Register(_ =>
            {
                return new AuthorizationProvider(_baseUrl);
            })
            .AsImplementedInterfaces()
            .AsSelf()
            .SingleInstance();

            builder.Register(_ =>
                {
                    return new AuthenticationProvider();
                })
            .AsImplementedInterfaces()
            .AsSelf()
            .SingleInstance();

            // builder.Register(_ =>
            //     {
            //         var services = new ServiceCollection();
            //         // services.AddScoped(_ => _configuration);
            //         // services.AddHttpClient<ILatestVersionProvider, LatestVersionProvider>();
            //         // var provider = services.BuildServiceProvider();
            //         // var client = provider.GetRequiredService<ILatestVersionProvider>();
            //         //return client;
            //     })
            //     .AsImplementedInterfaces()
            //     .AsSelf()
            //     .InstancePerDependency();
        }
    }
}
