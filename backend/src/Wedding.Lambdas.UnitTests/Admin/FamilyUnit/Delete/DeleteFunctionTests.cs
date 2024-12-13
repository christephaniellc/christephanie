using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Delete;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Delete
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Delete.Function))]
    public class DeleteFunctionTests
    {
        [Test]
        public async Task ShouldDeleteFamily()
        {
            var function = new Function();
            var context = new TestLambdaContext();
            var command = new DeleteFamilyUnitCommand("ABCDE");
            var request = new APIGatewayProxyRequest
            {
                Body = JsonSerializer.Serialize(command)
            };

            var result = await function.FunctionHandler(request, context);

            result.Should().Be(true);
        }
    }
}
