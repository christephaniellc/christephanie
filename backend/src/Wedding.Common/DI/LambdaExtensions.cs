using System;
using System.Collections.Generic;
using System.Reflection;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using Autofac;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Abstractions;

namespace Wedding.Common.DI
{
    public static class LambdaExtensions
    {
        public static IServiceCollection Add(
            this IServiceCollection collection,
            Action<ContainerBuilder> configure)
        {
            collection.AddSingleton(_ => configure);
            return collection;
        }

        public static IServiceCollection AddLambdaRegistrations(this IServiceCollection services, Type registrationHook)
        {
            services.AddSingleton<IAmazonDynamoDB, AmazonDynamoDBClient>();
            services.AddSingleton<IDynamoDBContext, DynamoDBContext>();
            services.AddLogging(logging => logging.AddConsole());

            services.AddWeddingAutomapper();

            services.Add(containerBuilder =>
                LambdaExtensions.LoadHandlers(containerBuilder, registrationHook));
            return services;
        }

        public static IServiceCollection AddWeddingAutomapper(this IServiceCollection services)
        {
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
            });

            IMapper mapper = mapperConfig.CreateMapper();
            services.AddSingleton(mapper);
            return services;
        }

        public static void LoadHandlers(ContainerBuilder builder, Type registrationHook)
        {
            var assemblies = new[] { registrationHook.Assembly };

            RegisterHandlers(builder, typeof(IAsyncQueryHandler<>), assemblies);
            RegisterHandlers(builder, typeof(IAsyncQueryHandler<,>), assemblies);
            RegisterHandlers(builder, typeof(IAsyncCommandHandler<>), assemblies);
            RegisterHandlers(builder, typeof(IAsyncCommandHandler<,>), assemblies);

            //builder.RegisterType<ControllerDispatcher>().AsImplementedInterfaces().InstancePerDependency();

            //builder.RegisterAutoMapper(typeof(RegistrationHook).Assembly);
        }

        private static void RegisterHandlers(ContainerBuilder builder, Type type, IEnumerable<Assembly> assemblies)
        {

            foreach (var assembly in assemblies)
            {
                builder.RegisterAssemblyTypes(assembly)
                    .Where(t => t.IsClosedTypeOf(type))
                    .AsImplementedInterfaces() //all other resolution
                    .InstancePerDependency();
            }
        }
    }
}
