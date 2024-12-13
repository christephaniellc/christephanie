using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Handlers;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Create;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Create.Function))]
public class CreateFunctionTests
{
    [Test]
    public async void ShouldCreateFamilyUnitHandler()
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

        result.Guests[0].FirstName.Should().Be("John");
    }
}
