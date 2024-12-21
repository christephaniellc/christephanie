using System.Diagnostics.CodeAnalysis;
using Amazon.DynamoDBv2.DataModel;
using Autofac;
using AutoMapper;
using Wedding.Abstractions.Enums;
using Wedding.Common.Configuration.Identity;
using Wedding.Lambdas.Authorize.Providers;
using Wedding.PublicApi.Logic.Services.Auth;
using IAuthorizationProvider = Wedding.Lambdas.Authorize.Providers.IAuthorizationProvider;

namespace Wedding.PublicApi.Logic.DI
{
    [ExcludeFromCodeCoverage]
    public class AuthModule : Module
    {
        private readonly SupportedAuthorizationProvidersEnum _authProvider;
        private readonly Auth0Configuration _config;

        public AuthModule(SupportedAuthorizationProvidersEnum authProvider, Auth0Configuration auth0Configuration)
        {
            _authProvider = authProvider;
            _config = auth0Configuration;
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
                            var mapper = context.Resolve<IMapper>();
                            return new Auth0Provider(_config.Authority, _config.Audience, _config.ClientId,
                                _config.ClientSecret, mapper, _config.DynamoUserTableName, _config.DynamoIdentityCol,
                                _config.DynamoIdentityIndex);
                            //return new Auth0AuthorizationProvider(_baseUrl);
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
                        // TODO SKS broken
                        return new AuthenticationProvider(authorizationProvider, "");
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
