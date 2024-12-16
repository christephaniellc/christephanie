using System;
using System.Diagnostics;

namespace Wedding.Common.Utility.Testing.CodeContracts
{
    public static class ContractSlim
    {
        public static void Requires<TException>(bool condition) where TException : Exception
        {
            if (condition)
                return;
            try
            {
                throw ((Exception)((object)((TException)Activator.CreateInstance(typeof(TException), (object)"Precondition failed")!)!)!)!;
                //throw (object)(TException)Activator.CreateInstance(typeof(TException), (object)"Precondition failed");
            }
            catch (Exception ex)
            {
                throw (Exception)(object)Activator.CreateInstance<TException>();
                //throw (object)Activator.CreateInstance<TException>();
            }
        }

        [Conditional("DEBUG")]
        [Conditional("CONTRACTS_FULL")]
        public static void Assume(bool condition)
        {
        }

        [Conditional("DEBUG")]
        [Conditional("CONTRACTS_FULL")]
        public static void Ensures(bool condition)
        {
        }

        public static T Result<T>() => default(T)!;
    }
}
