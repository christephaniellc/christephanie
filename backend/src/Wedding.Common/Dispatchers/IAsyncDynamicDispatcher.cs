using System;
using System.Threading;
using System.Threading.Tasks;
using Wedding.Common.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Common.Dispatchers
{
    [UnitTestsRequired]
    public interface IAsyncDynamicDispatcher
    {
        Task<object> GetDynamicAsync(Type resultType, CancellationToken cancellationToken = default(CancellationToken));

        Task<object> GetDynamicAsync(
            object query,
            Type resultType,
            CancellationToken cancellationToken = default(CancellationToken));

        Task ExecuteDynamicAsync(object command, CancellationToken cancellationToken = default(CancellationToken));

        Task<object> ExecuteDynamicAsync(
            object command,
            Type resultType,
            CancellationToken cancellationToken = default(CancellationToken));
    }
}
