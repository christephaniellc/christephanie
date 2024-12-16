using System;
using System.Collections.Generic;
using System.Linq;
using Wedding.Common.Utility.Testing.CodeContracts;

namespace Wedding.Common.Utility.Testing.TestChain
{
    public static class TypeHelper
    {
        public static bool IsAssignableToGenericType(this Type givenType, Type genericType)
        {
            ContractSlim.Requires<ArgumentNullException>(givenType != (Type)null!);
            if (((IEnumerable<Type>)givenType!.GetInterfaces()).Any<Type>((Func<Type, bool>)(it => it.IsGenericType && it.GetGenericTypeDefinition() == genericType)) || givenType.IsGenericType && givenType.GetGenericTypeDefinition() == genericType)
                return true;
            Type baseType = givenType.BaseType!;
            return baseType != (Type)null! && baseType.IsAssignableToGenericType(genericType);
        }
    }
}
