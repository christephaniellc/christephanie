using Autofac;
using System.Diagnostics.CodeAnalysis;

namespace Wedding.Common.Dispatchers
{
    [ExcludeFromCodeCoverage]
    public class ControllerDispatcher : DispatcherBase<IWeddingQuery, IWeddingCommand>, IControllerDispatcher
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ControllerDispatcher"/> class.
        /// </summary>
        /// <param name="lifetimeScope">The lifetime scope.</param>
        public ControllerDispatcher(ILifetimeScope lifetimeScope) : base(lifetimeScope)
        {
        }
    }
}
