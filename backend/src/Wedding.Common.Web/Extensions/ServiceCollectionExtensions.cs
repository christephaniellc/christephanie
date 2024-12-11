using System;
using System.Net.Http;
using Autofac;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Wedding.Common.Web.DI;
using Wedding.Common.Web.Options;
using Wedding.Common.Web.Http;
using AutoMapper;
using Wedding.Abstractions.Mapping;

namespace Wedding.Common.Web.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection Add(
            this IServiceCollection collection,
            Action<ContainerBuilder> configure)
        {
            collection.AddSingleton(_ => configure);
            return collection;
        }

        public static IServiceCollection AddWeddingAutomapper(this IServiceCollection services)
        {
            // Initialize AutoMapper with the profiles
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
            });

            IMapper mapper = mapperConfig.CreateMapper();
            services.AddSingleton(mapper);
            return services;
        }

        /// <summary>
        /// Add Handlers
        /// </summary>
        /// <param name="services"></param>
        /// <param name="assemblies">Assemblies that contain handlers</param>
        /// <returns></returns>
        // public static IServiceCollection? AddHandlers(this IServiceCollection? services, Assembly[] assemblies)
        // {
        //     _ = services?.Add(builder => HandlersHelpers.Load(builder, assemblies));
        //
        //     return services;
        // }

        /// <summary>
        /// Adds a custom data context the application.
        /// </summary>
        /// <typeparam name="TDbContext"></typeparam>
        /// <param name="services"></param>
        /// <returns></returns>
        public static IServiceCollection AddCosmosBoundedDataContext<TDbContext>(this IServiceCollection services)
            where TDbContext : DbContext => services.AddCosmosBoundedDataContext<TDbContext>(o => { });

        /// <summary>
        /// Adds a custom data context the application.
        /// </summary>
        /// <typeparam name="TDbContext"></typeparam>
        /// <param name="services"></param>
        /// <param name="config"><see cref="BoundedDataOptions" /> for bounded data context</param>
        /// <returns></returns>
        public static IServiceCollection AddCosmosBoundedDataContext<TDbContext>(this IServiceCollection services,
            Action<BoundedDataOptions> config) where TDbContext : DbContext
        {
            var boundedDataOptions = new BoundedDataOptions();
            config?.Invoke(boundedDataOptions);

            _ = services.AddHttpClientForCosmos();
            _ = services.Add(containerBuilder =>
                containerBuilder.RegisterModule(
                    new DataModule<TDbContext>(useRuntimeDataBoundary: boundedDataOptions.UseRuntimeDataBoundary)));
            return services;
        }

        /// <summary>
        /// Adds CosmosDb http client and OpenTelemetry delegating handler
        /// </summary>
        /// <param name="services"></param>
        /// <param name="name"></param>
        /// <param name="configure"></param>
        /// <param name="sensitiveDataLoggingIsEnabled"></param>
        /// <returns></returns>
        public static IServiceCollection AddHttpClientForCosmos(this IServiceCollection services, string name = OpenTelemetryHttpHandler.ClientName, Action<HttpClient>? configure = null, bool sensitiveDataLoggingIsEnabled = false)
        {
            configure ??= _ => { };

            services.AddHttpClient(name, configure)
                .AddHttpMessageHandler<OpenTelemetryHttpHandler>().Services
                .TryAddTransient(_ => new OpenTelemetryHttpHandler(sensitiveDataLoggingIsEnabled));

            return services;
        }
    }
}
