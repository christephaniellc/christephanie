namespace Wedding.Common.Dispatchers
{
    /// <summary>
    /// Interface combining all flavors of dispatcher
    /// </summary>
    /// <typeparam name="TQueryLimitType">The type of the query limit type.</typeparam>
    /// <typeparam name="TCommandLimitType">The type of the command limit type.</typeparam>
    /// <seealso cref="ISyncDispatcher{TQueryLimitType,TCommandLimitType}" />
    /// <seealso cref="IAsyncDispatcher{TQueryLimitType,TCommandLimitType}" />
    /// <seealso cref="ISyncDynamicDispatcher" />
    /// <seealso cref="IAsyncDynamicDispatcher" />
    public interface IDispatcher<in TQueryLimitType, in TCommandLimitType> :
        ISyncDispatcher<TQueryLimitType, TCommandLimitType>,
        IAsyncDispatcher<TQueryLimitType, TCommandLimitType>,
        ISyncDynamicDispatcher,
        IAsyncDynamicDispatcher
    {
    }
}
