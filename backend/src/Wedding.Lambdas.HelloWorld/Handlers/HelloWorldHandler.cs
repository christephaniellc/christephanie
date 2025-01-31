using System.Threading;
using System.Threading.Tasks;
using Wedding.Common.Abstractions;

namespace Wedding.Lambdas.HelloWorld.Handlers
{
    public class HelloWorldHandler : IAsyncQueryHandler<string>
    {
        public async Task<string> GetAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            return await Task.FromResult("Hello, World! I can auto deploy with github!");
        }
    }
}
