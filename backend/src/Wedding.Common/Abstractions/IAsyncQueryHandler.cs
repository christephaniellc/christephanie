using System.Threading;
using System.Threading.Tasks;
using Wedding.Common.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Common.Abstractions
{
    [UnitTestsRequired]
    public interface IAsyncQueryHandler<TResult> : IAsyncHandler
    {
        Task<TResult> GetAsync(CancellationToken cancellationToken = default(CancellationToken));
    }

    [UnitTestsRequired]
    public interface IAsyncQueryHandler<in TQuery, TResult> : IAsyncHandler
    {
        Task<TResult> GetAsync(TQuery query, CancellationToken cancellationToken = default(CancellationToken));
    }
}
