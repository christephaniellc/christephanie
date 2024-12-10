using Wedding.Common.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Common.Dispatchers
{
    [UnitTestsRequired]
    public interface ICommandHandler<in TCommand> : IHandler
    {
        void Execute(TCommand command);
    }

    [UnitTestsRequired]
    public interface ICommandHandler<in TCommand, out TResult> : IHandler
    {
        TResult Execute(TCommand command);
    }
}
