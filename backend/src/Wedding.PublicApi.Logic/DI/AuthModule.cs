using System.Diagnostics.CodeAnalysis;
using Amazon.DynamoDBv2.DataModel;
using Autofac;
using Wedding.Abstractions.Enums;
using Wedding.Common.Configuration.Identity;
using Wedding.PublicApi.Logic.Services.Auth;

namespace Wedding.PublicApi.Logic.DI
{
    [ExcludeFromCodeCoverage]
    public class AuthModule : Module
    {
        private readonly SupportedAuthorizationProvidersEnum _authProvider;
        private readonly string _baseUrl;

        public AuthModule(SupportedAuthorizationProvidersEnum authProvider, string baseUrl)
        {
            _authProvider = authProvider;
            _baseUrl = baseUrl;
        }
        
        /// <inheritdoc cref="Module"/>
        protected override void Load(ContainerBuilder builder)
        {
            if (_authProvider == SupportedAuthorizationProvidersEnum.NoOpAdmin ||
                _authProvider == SupportedAuthorizationProvidersEnum.NoOpUser)
            {
                var isAdmin = _authProvider == SupportedAuthorizationProvidersEnum.NoOpAdmin;
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
                        if (_authProvider == SupportedAuthorizationProvidersEnum.Auth0)
                        {
                            return new Auth0AuthorizationProvider(_baseUrl);
                        }

                        var repository = context.Resolve<IDynamoDBContext>();
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
