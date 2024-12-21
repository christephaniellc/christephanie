using System;
using System.Linq;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Wedding.Common.Web.Extensions
{
    public static class HostBuilderExtensions
    {

        public static IHostBuilder ConfigureAutofacContainer(
            this IHostBuilder hostBuilder,
            IServiceCollection serviceCollection)
        {
            hostBuilder.ConfigureAutofacContainer(serviceCollection,
                (Action<HostBuilderContext, IServiceCollection, ContainerBuilder>)null!);
            return hostBuilder;
        }

        public static IHostBuilder ConfigureAutofacContainer(
            this IHostBuilder hostBuilder,
            IServiceCollection serviceCollection,
            Action<HostBuilderContext, IServiceCollection, ContainerBuilder>? configureDelegate)
        {
            hostBuilder
                .UseServiceProviderFactory<ContainerBuilder>(
                    (IServiceProviderFactory<ContainerBuilder>)new AutofacServiceProviderFactory())
                .ConfigureContainer<ContainerBuilder>(
                    (Action<HostBuilderContext, ContainerBuilder>)((context, builder) =>
                    {
                        Action<HostBuilderContext, IServiceCollection, ContainerBuilder> action1 = configureDelegate!;
                        if (action1 != null)
                            action1(context, serviceCollection, builder);
                        NoOpServiceProvider sp = new NoOpServiceProvider();
                        foreach (Action<ContainerBuilder> action2 in serviceCollection
                                     .Where<ServiceDescriptor>((Func<ServiceDescriptor, bool>)(sd =>
                                         sd.ServiceType == typeof(Action<ContainerBuilder>)))
                                     .Select<ServiceDescriptor, object>((Func<ServiceDescriptor, object>)(sd =>
                                         sd.ImplementationFactory!((IServiceProvider)sp)))
                                     .Cast<Action<ContainerBuilder>>().ToArray<Action<ContainerBuilder>>())
                            action2(builder);
                    }));
            return hostBuilder;

        }

        private class NoOpServiceProvider : IServiceProvider
        {
            public object? GetService(Type serviceType) => null;
        }
    }
}