using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using Autofac;
using Autofac.Core;
using Autofac.Core.Activators.Delegate;
using Autofac.Core.Lifetime;
using Autofac.Core.Registration;
using Microsoft.Extensions.Logging;

namespace Wedding.Common.DI
{
    /// <summary>
    /// Logging module
    /// </summary>
    /// <seealso cref="Autofac.Module" />
    [ExcludeFromCodeCoverage]
    public class LoggingModule : Module
    {
        /// <inheritdoc />
        protected override void Load(ContainerBuilder builder) =>
            //logger factory is already registered
            _ = builder.RegisterSource<LoggerRegistrationSource>();

        private class LoggerRegistrationSource : IRegistrationSource
        {
            public IEnumerable<IComponentRegistration> RegistrationsFor(
                Service service,
                Func<Service, IEnumerable<ServiceRegistration>> registrationAccessor)
            {
                if (service is not IServiceWithType swt || !swt.ServiceType.IsGenericType ||
                    swt.ServiceType.GetGenericTypeDefinition() != typeof(ILogger<>))
                {
                    //not looking for ILogger
                    return Enumerable.Empty<IComponentRegistration>();
                }

                var registration = new ComponentRegistration(
                    Guid.NewGuid(),
                    new DelegateActivator(swt.ServiceType, (c, p) =>
                    {
                        var factory = c.Resolve<ILoggerFactory>();

                        var genericLoggerType = typeof(Logger<>);
                        var loggerType = genericLoggerType.MakeGenericType(swt.ServiceType.GenericTypeArguments[0]);

#pragma warning disable CS8603 // Possible null reference return.
                        return Activator.CreateInstance(loggerType, factory);
#pragma warning restore CS8603 // Possible null reference return.
                    }),
                    new CurrentScopeLifetime(),
                    InstanceSharing.None,
                    InstanceOwnership.OwnedByLifetimeScope,
                    new[] { service },
                    new Dictionary<string, object?>());

                return new IComponentRegistration[] { registration };
            }

            public bool IsAdapterForIndividualComponents => false;
        }
    }
}