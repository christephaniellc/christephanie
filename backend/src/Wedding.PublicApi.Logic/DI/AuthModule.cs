using System.Diagnostics.CodeAnalysis;
using Amazon.DynamoDBv2.DataModel;
using Autofac;
using Wedding.Common.Configuration;
using Wedding.PublicApi.Logic.Services.Auth;

namespace Wedding.PublicApi.Logic.DI
{
    [ExcludeFromCodeCoverage]
    public class AuthModule : Module
    {
        private readonly SupportedAuthorizationProviders _authProvider;
        private readonly string _baseUrl;

        public AuthModule(SupportedAuthorizationProviders authProvider, string baseUrl)
        {
            _authProvider = authProvider;
            _baseUrl = baseUrl;
        }
        
        /// <inheritdoc cref="Module"/>
        protected override void Load(ContainerBuilder builder)
        {
            if (_authProvider == SupportedAuthorizationProviders.NoOpAdmin ||
                _authProvider == SupportedAuthorizationProviders.NoOpUser)
            {
                var isAdmin = _authProvider == SupportedAuthorizationProviders.NoOpAdmin;
                builder.Register(_ =>
                    {
                        return new NoOpAuthorizationProvider(isAdmin);
                    })
                    .AsImplementedInterfaces()
                    .AsSelf()
                    .SingleInstance();
            }
            else
            {
                builder.Register<IAuthorizationProvider>(context =>
                    {
                        var repository = context.Resolve<IDynamoDBContext>();

                        if (_authProvider == SupportedAuthorizationProviders.Auth0)
                        {
                            return new Auth0AuthorizationProvider(_baseUrl);
                        }

                        return new InternalAuthorizationProvider(repository);
                    })
                    .AsImplementedInterfaces()
                    .AsSelf()
                    .SingleInstance();

                builder.Register(context =>
                    {
                        var authorizationProvider = context.Resolve<IAuthorizationProvider>();
                        // var services = new ServiceCollection();
                        // var provider = services.BuildServiceProvider();
                        // var authorizationProvider = provider.GetRequiredService<IAuthorizationProvider>();
                        return new AuthenticationProvider(authorizationProvider, _baseUrl);
                    })
                    .AsImplementedInterfaces()
                    .AsSelf()
                    .SingleInstance();
            }

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
