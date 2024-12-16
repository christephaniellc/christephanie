using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NUnit.Framework;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create;
using Wedding.Lambdas.FamilyUnit.Get.Commands;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Get;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.FamilyUnit.Get.Function))]
public class GetFunctionTests
{
    [Test]
    public async void TestGetFunction()
    {
        var function = new Function();
        var context = new TestLambdaContext();
        var command = new GetFamilyUnitQuery("ABCDE", "John");
        var request = new APIGatewayProxyRequest {
            Body = JsonSerializer.Serialize(command)
        };

        var result = await function.FunctionHandler(request, context);

        result.Guests.Should().NotBeNull();
        result.Guests!.Count.Should().BeGreaterThan(0);
        result.Guests![0].FirstName.Should().Be("John");
    }
}
