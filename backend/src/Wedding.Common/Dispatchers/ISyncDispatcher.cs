using Wedding.Common.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Common.Dispatchers
{
    [UnitTestsRequired]
    public interface ISyncDispatcher<in TQueryLimitType, in TCommandLimitType>
    {
        TResult Get<TResult>();

        TResult Get<TQuery, TResult>(TQuery query) where TQuery : TQueryLimitType;

        void Execute<TCommand>(TCommand command) where TCommand : TCommandLimitType;

        TResult Execute<TCommand, TResult>(TCommand command) where TCommand : TCommandLimitType;
    }
}
