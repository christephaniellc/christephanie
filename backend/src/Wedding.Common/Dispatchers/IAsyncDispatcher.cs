using System.Threading;
using System.Threading.Tasks;
using Wedding.Common.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Common.Dispatchers
{
    /// <summary>
    ///    Interface for a asynchronous query/command dispatcher
    /// </summary>
    /// <typeparam name="TQueryLimitType">The type of the query limit type.</typeparam>
    /// <typeparam name="TCommandLimitType">The type of the command limit type.</typeparam>
    [UnitTestsRequired]
    public interface IAsyncDispatcher<in TQueryLimitType, in TCommandLimitType>
    {
        /// <summary>
        ///     Gets a query result by resolving a handler based on the result type.
        /// </summary>
        /// <typeparam name="TResult">The type of the response.</typeparam>
        /// <returns></returns>
        Task<TResult> GetAsync<TResult>(CancellationToken cancellationToken = default(CancellationToken));

        /// <summary>
        /// Gets a query result by resolving a handler based on the query and result types.
        /// </summary>
        /// <typeparam name="TQuery">The type of the query.</typeparam>
        /// <typeparam name="TResult">The type of the result.</typeparam>
        /// <param name="query">The query.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<TResult> GetAsync<TQuery, TResult>(TQuery query, CancellationToken cancellationToken = default(CancellationToken)) where TQuery : TQueryLimitType;

        /// <summary>
        /// Executes a command by resolving a handler based on the command type. The handler will not return anything.
        /// </summary>
        /// <typeparam name="TCommand">The type of the command.</typeparam>
        /// <param name="command">The command.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task ExecuteAsync<TCommand>(TCommand command, CancellationToken cancellationToken = default(CancellationToken)) where TCommand : TCommandLimitType;

        /// <summary>
        /// Executes a command result by resolving a handler based on the command and result types.
        /// </summary>
        /// <typeparam name="TCommand">The type of the command.</typeparam>
        /// <typeparam name="TResult">The type of the result.</typeparam>
        /// <param name="command">The command.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns></returns>
        Task<TResult> ExecuteAsync<TCommand, TResult>(TCommand command, CancellationToken cancellationToken = default(CancellationToken)) where TCommand : TCommandLimitType;
    }
}
