using System.Threading;
using System.Threading.Tasks;
using Wedding.Common.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Common.Abstractions
{
    [UnitTestsRequired]
    public interface IAsyncCommandHandler<in TCommand> : IAsyncHandler
    {
        Task ExecuteAsync(TCommand command, CancellationToken cancellationToken = default(CancellationToken));
    }

    [UnitTestsRequired]
    public interface IAsyncCommandHandler<in TCommand, TResult> : IAsyncHandler
    {
        Task<TResult> ExecuteAsync(TCommand command, CancellationToken cancellationToken = default(CancellationToken));
    }
}
