using System.Reflection;
using Wedding.Common.Dispatchers;
using Wedding.Common.Utility.Testing.TestChain.Wedding.Common.TestChain;

namespace Wedding.PublicApi.Logic.UnitTests.CodeQuality
{
    public class PublicApiLogicTestsRequiredFixture : TestsRequiredFixture
    {
        public PublicApiLogicTestsRequiredFixture()
        {
            LogicAssemblies = new[]
            {
                typeof(RegistrationHook).GetTypeInfo().Assembly
            };
            TestAssemblies = new[] {
                GetType().GetTypeInfo().Assembly,
                typeof(ElsewhereTests).GetTypeInfo().Assembly,
            };
            ExemptTestableTypes = new[]
            {
                //Reason: coming from a nuget and just inheriting without custom logic
                typeof(IControllerDispatcher)
            };

        }
    }
}
