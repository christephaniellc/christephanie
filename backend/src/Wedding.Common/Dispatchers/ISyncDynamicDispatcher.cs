using System;
using Wedding.Common.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Common.Dispatchers
{
    [UnitTestsRequired]
    public interface ISyncDynamicDispatcher
    {
        object GetDynamic(Type resultType);

        object GetDynamic(object query, Type resultType);

        void ExecuteDynamic(object command);

        object ExecuteDynamic(object command, Type resultType);
    }
}
