using System;
using System.Collections.Generic;
using System.Reflection;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using Autofac;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Multitenancy;

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
            services.AddScoped<IDynamoDBContext, DynamoDBContext>();
            services.AddScoped<IDynamoDBProvider, DynamoDBProvider>();
            services.AddScoped<IMultitenancySettingsProvider, MultitenancySettingsProvider>();
            services.AddLogging(logging => logging.AddConsole());

            services.AddWeddingAutomapper();

            services.Add(containerBuilder =>
            {
                // containerBuilder.RegisterType<MultitenancySettingsProvider>()
                //     .As<IMultitenancySettingsProvider>()
                //     .InstancePerDependency();
                
                LambdaExtensions.LoadHandlers(containerBuilder, registrationHook);
            });
            return services;
        }

        public static IServiceCollection AddWeddingAutomapper(this IServiceCollection services)
        {
            var mapper = MappingProfileHelper.GetMapper();
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

        public static void PrintRegisteredServices(this IServiceCollection services)
        {
            Console.WriteLine("Registered Services:");
            foreach (var service in services)
            {
                Console.WriteLine($"Service: {service.ServiceType.FullName}, " +
                                  $"Implementation: {service.ImplementationType?.FullName ?? "Factory/Instance"}, " +
                                  $"Lifetime: {service.Lifetime}");
            }
        }

        public static void PrintScopeServices(this IServiceScope scope, params Type[] serviceTypes)
        {
            var scopedProvider = scope.ServiceProvider;
            Console.WriteLine("Checking services in the scope:");

            foreach (var serviceType in serviceTypes)
            {
                var service = scopedProvider.GetService(serviceType);
                if (service != null)
                {
                    Console.WriteLine($"{serviceType.FullName} is registered and resolvable.");
                }
                else
                {
                    Console.WriteLine($"{serviceType.FullName} is NOT registered in this scope.");
                }
            }
        }
    }
}
