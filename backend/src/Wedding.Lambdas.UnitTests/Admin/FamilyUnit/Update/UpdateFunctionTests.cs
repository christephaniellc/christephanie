using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Handlers;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Update.Function))]
public class GetFunctionTests
{
    [Test]
    public async void TestUpdateFunction()
    {
        var function = new Function();
        var context = new TestLambdaContext();
        var command = new CreateFamilyUnitCommand(
            new FamilyUnitDto
            {
                RsvpCode = "ABCDE",
                Tier = "A",
                Guests = new List<GuestDto>
                {
                    new GuestDto
                    {
                        FirstName = "John",
                        LastName = "Doe"
                    }
                }
            }
        );
        var request = new APIGatewayProxyRequest {
            Body = JsonSerializer.Serialize(command)
        };

        var result = await function.FunctionHandler(request, context);

        result.Guests.Should().NotBeNull();
        result.Guests!.Count.Should().BeGreaterThan(0);
        result.Guests![0].FirstName.Should().Be("John");
    }
}
