using System.Collections.Generic;
using System.Reflection;
using System;
using Autofac;
using Wedding.Common.Abstractions;
using Wedding.Common.Dispatchers;
using Module = Autofac.Module;

namespace Wedding.PublicApi.Logic.DI
{
    public class LogicModule : Module
    {
        /// <summary>
        /// Override to add registrations to the container.
        /// </summary>
        /// <param name="builder">The builder through which components can be
        /// registered.</param>
        /// <remarks>
        /// Note that the ContainerBuilder parameter is unique to this module.
        /// </remarks>
        protected override void Load(ContainerBuilder builder)
        {
            var assemblies = new[] { typeof(RegistrationHook).Assembly };

            LoadHandlers(builder, typeof(IAsyncQueryHandler<>), assemblies);
            LoadHandlers(builder, typeof(IAsyncQueryHandler<,>), assemblies);
            LoadHandlers(builder, typeof(IAsyncCommandHandler<>), assemblies);
            LoadHandlers(builder, typeof(IAsyncCommandHandler<,>), assemblies);

            builder.RegisterType<ControllerDispatcher>().AsImplementedInterfaces().InstancePerDependency();

            //builder.RegisterAutoMapper(typeof(RegistrationHook).Assembly);
        }

        private void LoadHandlers(ContainerBuilder builder, Type type, IEnumerable<Assembly> assemblies)
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
