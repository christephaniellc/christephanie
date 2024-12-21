using Wedding.Common.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Common.Dispatchers
{
    [UnitTestsRequired]
    public interface IQueryHandler<out TResult> : IHandler
    {
        TResult Get();
    }

    [UnitTestsRequired]
    public interface IQueryHandler<in TQuery, out TResult> : IHandler
    {
        TResult Get(TQuery query);
    }
}
