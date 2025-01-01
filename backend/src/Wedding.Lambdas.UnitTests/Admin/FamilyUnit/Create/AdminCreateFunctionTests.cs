using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Create;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Create.Function))]
public class AdminCreateFunctionTests
{
    [Test]
    public async Task ShouldCreateFamilyUnitHandler()
    {
        var function = new Wedding.Lambdas.Admin.FamilyUnit.Create.Function();
        var context = new TestLambdaContext();
        var command = new AdminCreateFamilyUnitCommand(
            new FamilyUnitDto
            {
                InvitationCode = "ABCDE",
                Tier = "A",
                Guests = new List<GuestDto>
                {
                    new GuestDto
                    {
                        FirstName = "John",
                        LastName = "Doe",
                        GuestNumber = 1,
                        Roles = new List<RoleEnum> { RoleEnum.Guest }
                    }
                }
            }
        );
        var request = new APIGatewayProxyRequest {
            Body = JsonSerializer.Serialize(command, JsonSerializationHelper.FromFrontendOptions)
    };

        var json = request.Body; // Replace with actual JSON
        var command2 = JsonSerializationHelper.DeserializeFromFrontend<AdminCreateFamilyUnitCommand>(json);

        var response = await function.FunctionHandler(request, context);
        var result = response.GetResponseBody<FamilyUnitDto>();

        result.Guests.Should().NotBeNull();
        result.Guests!.Count.Should().BeGreaterThan(0);
        result.Guests![0].FirstName.Should().Be("John");
    }
}
