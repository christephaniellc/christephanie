using System.Diagnostics.CodeAnalysis;
using Autofac;
using Wedding.PublicApi.Logic.Services;

namespace Wedding.PublicApi.Logic.DI
{

    [ExcludeFromCodeCoverage]
    public class AuthModuleNoOp : Module
    {
        private readonly bool _isAdmin;

        public AuthModuleNoOp(bool isAdmin)
        {
            _isAdmin = isAdmin;
        }

        /// <inheritdoc cref="Module"/>
        protected override void Load(ContainerBuilder builder)
        {
            builder.Register(_ =>
                {
                    return new NoOpAuthorizationProvider(_isAdmin);
                })
                .AsImplementedInterfaces()
                .AsSelf()
                .SingleInstance();
        }
    }
}
