// using System;
// using System.Reflection;
// using Autofac;
// using Wedding.Common.Abstractions;
// using Wedding.Common.Dispatchers;
//
// namespace Wedding.Common.Web.Extensions
// {
//     /// <summary>
//     /// 
//     /// </summary>
//     public static class HandlersHelpers
//     {
//         /// <summary>
//         /// Loads the handlers for dispatcher-handler pattern
//         /// </summary>
//         /// <param name="builder"></param>
//         /// <param name="assemblies">Assemblies that contain handlers</param>
//         public static void Load(ContainerBuilder builder, Assembly[] assemblies)
//         {
//             foreach (var assembly in assemblies)
//             {
//                 LoadHandlers(builder, typeof(IAsyncQueryHandler<>), assembly);
//                 LoadHandlers(builder, typeof(IAsyncQueryHandler<,>), assembly);
//                 LoadHandlers(builder, typeof(IAsyncCommandHandler<>), assembly);
//                 LoadHandlers(builder, typeof(IAsyncCommandHandler<,>), assembly);
//             }
//
//             _ = builder.RegisterType<ControllerDispatcher>().AsImplementedInterfaces().InstancePerDependency();
//         }
//
//         private static void LoadHandlers(ContainerBuilder builder, Type type, Assembly assembly)
//         {
//
//             _ = builder.RegisterAssemblyTypes(assembly)
//                 .Where(t => t.IsClosedTypeOf(type))
//                 .AsImplementedInterfaces() //all other resolution
//                 .InstancePerDependency();
//         }
//     }
//
// }
