using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Create;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Create.Function))]
public class CreateFunctionTests
{
    [Test]
    public async void ShouldCreateFamilyUnitHandler()
    {
        var function = new Wedding.Lambdas.Admin.FamilyUnit.Create.Function();
        var context = new TestLambdaContext();
        var command = new CreateFamilyUnitCommand(
            new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
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

        var response = await function.FunctionHandler(request, context);
        var result = APIGatewayProxyResponseHelper.GetResponseBody<FamilyUnitDto>(response);

        result.Guests.Should().NotBeNull();
        result.Guests!.Count.Should().BeGreaterThan(0);
        result.Guests![0].FirstName.Should().Be("John");
    }
}
