using System;
using System.Threading;
using System.Threading.Tasks;
using Autofac;
using Wedding.Common.Abstractions;

namespace Wedding.Common.Dispatchers
{
    /// <summary>
    ///     Dispatcher base. Provides core implementation that we locked down do a subset/limit base type
    /// </summary>
    /// <typeparam name="TQueryLimitType">The type of the query limit type.</typeparam>
    /// <typeparam name="TCommandLimitType">The type of the command limit type.</typeparam>
    public abstract class DispatcherBase<TQueryLimitType, TCommandLimitType> : IDispatcher<TQueryLimitType, TCommandLimitType>
    {
        //TODO: Add activities around handler resolution and execution.

        private readonly ILifetimeScope _lifetimeScope;

        /// <summary>
        ///     Initializes a new instance of the <see cref="DispatcherBase{TQueryLimitType, TCommandLimitType}" /> class.
        /// </summary>
        /// <param name="lifetimeScope">The lifetime scope.</param>
        protected DispatcherBase(ILifetimeScope lifetimeScope)
        {
            _lifetimeScope = lifetimeScope;
        }

        #region Sync
        /// <inheritdoc/>
        public virtual TResult Get<TResult>()
        {
            var handler = _lifetimeScope.Resolve<IQueryHandler<TResult>>();
            return handler.Get();
        }

        /// <inheritdoc/>
        public virtual TResult Get<TQuery, TResult>(TQuery query)
            where TQuery : TQueryLimitType
        {
            var handler = _lifetimeScope.Resolve<IQueryHandler<TQuery, TResult>>();
            return handler.Get(query);
        }

        /// <inheritdoc/>
        public virtual void Execute<TCommand>(TCommand command)
            where TCommand : TCommandLimitType
        {
            var handler = _lifetimeScope.Resolve<ICommandHandler<TCommand>>();
            handler.Execute(command);
        }

        /// <inheritdoc/>
        public virtual TResult Execute<TCommand, TResult>(TCommand command)
            where TCommand : TCommandLimitType
        {
            var handler = _lifetimeScope.Resolve<ICommandHandler<TCommand, TResult>>();
            return handler.Execute(command);
        }
        #endregion

        #region Dynamic

        private static void EnsurePublicClassForDynamicUse(Type type)
        {
            if (type.IsPublic)
            {
                return;
            }

            throw new NotSupportedException("Only public handlers can be used in dynamic calls. Make sure the handler class is public.");

        }

        /// <inheritdoc/>
        public virtual object GetDynamic(Type resultType)
        {
            var handlerInterfaceType = typeof(IQueryHandler<>);
            var handlerType = handlerInterfaceType.MakeGenericType(resultType);

            dynamic handler = _lifetimeScope.Resolve(handlerType);
            EnsurePublicClassForDynamicUse(handler.GetType());

            return handler.Get();
        }

        /// <inheritdoc/>
        public virtual object GetDynamic(object query, Type resultType)
        {
            var handlerInterfaceType = typeof(IQueryHandler<,>);
            var handlerType = handlerInterfaceType.MakeGenericType(query.GetType(), resultType);

            dynamic handler = _lifetimeScope.Resolve(handlerType);
            EnsurePublicClassForDynamicUse(handler.GetType());

            return handler.Get((dynamic)query);
        }

        /// <inheritdoc/>
        public virtual void ExecuteDynamic(object command)
        {
            var handlerInterfaceType = typeof(ICommandHandler<>);
            var handlerType = handlerInterfaceType.MakeGenericType(command.GetType());

            dynamic handler = _lifetimeScope.Resolve(handlerType);
            EnsurePublicClassForDynamicUse(handler.GetType());

            handler.Execute((dynamic)command);
        }

        /// <inheritdoc/>
        public virtual object ExecuteDynamic(object command, Type resultType)
        {
            var handlerInterfaceType = typeof(ICommandHandler<,>);
            var handlerType = handlerInterfaceType.MakeGenericType(command.GetType(), resultType);

            dynamic handler = _lifetimeScope.Resolve(handlerType);
            EnsurePublicClassForDynamicUse(handler.GetType());

            return handler.Execute((dynamic)command);
        }
        #endregion

        #region Async
        /// <inheritdoc/>
        public async Task<TResult> GetAsync<TResult>(CancellationToken cancellationToken = default(CancellationToken))
        {
            var handler = _lifetimeScope.Resolve<IAsyncQueryHandler<TResult>>();
            return await handler.GetAsync(cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<TResult> GetAsync<TQuery, TResult>(TQuery query, CancellationToken cancellationToken = default(CancellationToken)) where TQuery : TQueryLimitType
        {
            var handler = _lifetimeScope.Resolve<IAsyncQueryHandler<TQuery, TResult>>();
            return await handler.GetAsync(query, cancellationToken);
        }

        /// <inheritdoc/>
        public async Task ExecuteAsync<TCommand>(TCommand command, CancellationToken cancellationToken = default(CancellationToken)) where TCommand : TCommandLimitType
        {
            var handler = _lifetimeScope.Resolve<IAsyncCommandHandler<TCommand>>();
            await handler.ExecuteAsync(command, cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<TResult> ExecuteAsync<TCommand, TResult>(TCommand command, CancellationToken cancellationToken = default(CancellationToken)) where TCommand : TCommandLimitType
        {
            var handler = _lifetimeScope.Resolve<IAsyncCommandHandler<TCommand, TResult>>();
            return await handler.ExecuteAsync(command, cancellationToken);
        }
        #endregion

        #region Async dynamic
        /// <inheritdoc/>
        public async Task<object> GetDynamicAsync(Type resultType, CancellationToken cancellationToken = default(CancellationToken))
        {

            var handlerInterfaceType = typeof(IAsyncQueryHandler<>);
            var handlerType = handlerInterfaceType.MakeGenericType(resultType);

            dynamic handler = _lifetimeScope.Resolve(handlerType);
            EnsurePublicClassForDynamicUse(handler.GetType());

            return await handler.GetAsync(cancellationToken);
        }
        /// <inheritdoc/>
        public async Task<object> GetDynamicAsync(object query, Type resultType, CancellationToken cancellationToken = default(CancellationToken))
        {
            var handlerInterfaceType = typeof(IAsyncQueryHandler<,>);
            var handlerType = handlerInterfaceType.MakeGenericType(query.GetType(), resultType);

            dynamic handler = _lifetimeScope.Resolve(handlerType);
            EnsurePublicClassForDynamicUse(handler.GetType());

            return await handler.GetAsync((dynamic)query, cancellationToken);
        }
        /// <inheritdoc/>
        public async Task ExecuteDynamicAsync(object command, CancellationToken cancellationToken = default(CancellationToken))
        {
            var handlerInterfaceType = typeof(IAsyncCommandHandler<>);
            var handlerType = handlerInterfaceType.MakeGenericType(command.GetType());

            dynamic handler = _lifetimeScope.Resolve(handlerType);
            EnsurePublicClassForDynamicUse(handler.GetType());

            await handler.ExecuteAsync((dynamic)command, cancellationToken);
        }
        /// <inheritdoc/>
        public async Task<object> ExecuteDynamicAsync(object command, Type resultType, CancellationToken cancellationToken = default(CancellationToken))
        {
            var handlerInterfaceType = typeof(IAsyncCommandHandler<,>);
            var handlerType = handlerInterfaceType.MakeGenericType(command.GetType(), resultType);

            dynamic handler = _lifetimeScope.Resolve(handlerType);
            EnsurePublicClassForDynamicUse(handler.GetType());

            return await handler.ExecuteAsync((dynamic)command, cancellationToken);
        }
        #endregion
    }
}