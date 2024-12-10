// using Autofac;
// using System.Diagnostics.CodeAnalysis;
// using System.Reflection;
// using Wedding.Common.Helpers;
// using Module = Autofac.Module;
//
// namespace Wedding.Common.DI
// {
//     [ExcludeFromCodeCoverage]
//     public class HandlersModule : Module
//     {
//         private readonly Assembly[] _handlerAssemblies;
//
//         /// <summary>
//         /// Creates a new instance of <see cref="HandlersModule"/>
//         /// </summary>
//         /// <param name="handlerAssemblies"></param>
//         public HandlersModule(Assembly[] handlerAssemblies) => _handlerAssemblies = handlerAssemblies;
//
//         /// <summary>
//         /// Override to add registrations to the container.
//         /// </summary>
//         /// <param name="builder">The builder through which components can be
//         /// registered.</param>
//         /// <remarks>
//         /// Note that the ContainerBuilder parameter is unique to this module.
//         /// </remarks>
//         protected override void Load(ContainerBuilder builder) => HandlersHelpers.Load(builder, _handlerAssemblies);
//     }
// }
