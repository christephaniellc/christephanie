using System.Diagnostics.CodeAnalysis;
using Amazon.DynamoDBv2.DataModel;
using Autofac;
using AutoMapper;
using Wedding.Abstractions.Enums;
using Wedding.Common.Configuration.Identity;
using Wedding.Lambdas.Authorize.Providers;
using Wedding.PublicApi.Logic.Services.Auth;

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
                        return new NoOpAuthenticationProvider(isAdmin);
                    })
                    .AsImplementedInterfaces()
                    .AsSelf()
                    .SingleInstance();
            }
            else
            {
                builder.Register<IAuthenticationProvider>(context =>
                    {
                        if (_authProvider == SupportedAuthorizationProvidersEnum.Auth0)
                        {
                            var mapper = context.Resolve<IMapper>();

                            return new Auth0Provider(mapper, _config.Authority, _config.Audience);
                        }

                        var repository = context.Resolve<IDynamoDBContext>();
                        return new InternalAuthenticationProvider(repository);
                    })
                    .AsImplementedInterfaces()
                    .AsSelf()
                    .SingleInstance();

                builder.Register<IAuthorizationProvider>(context =>
                    {
                        var mapper = context.Resolve<IMapper>();
                        var repository = context.Resolve<IDynamoDBContext>();
                        var authenticationProvider = context.Resolve<IAuthenticationProvider>();
                        return new DatabaseRoleProvider(mapper, repository, authenticationProvider);
                    })
                    .AsImplementedInterfaces()
                    .AsSelf()
                    .SingleInstance();

                // builder.Register(context =>
                //     {
                //         var authenticationProvider = context.Resolve<IAuthenticationProvider>();
                //         // var services = new ServiceCollection();
                //         // var provider = services.BuildServiceProvider();
                //         // var authenticationProvider = provider.GetRequiredService<IAuthenticationProvider>();
                //         // TODO SKS broken
                //         return new AuthenticationProvider(authenticationProvider, "");
                //     })
                //     .AsImplementedInterfaces()
                //     .AsSelf()
                //     .SingleInstance();
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
