using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
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
        var command = new GetFamilyUnitQuery("ABCDE");
        var request = new APIGatewayProxyRequest {
            Body = JsonSerializer.Serialize(command)
        };

        var result = await function.FunctionHandler(request, context);

        result.Guests[0].FirstName.Should().Be("John");
    }
}
