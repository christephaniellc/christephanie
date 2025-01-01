using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Update;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Update.Function))]
public class GetFunctionTests
{
    [Test]
    public async Task TestUpdateFunction()
    {
        try
        {
            var dto = JsonSerializer.Deserialize<FamilyUnitDto>(TestDataHelper.REAL_JSON_FAMILY_UNIT, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        var testDto =
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
            };

        var function = new Wedding.Lambdas.Admin.FamilyUnit.Create.Function();
        var context = new TestLambdaContext();
        var command = new AdminUpdateFamilyUnitCommand(dto, dto.Guests[0].Roles);
        var request = new APIGatewayProxyRequest {
            Body = JsonSerializer.Serialize(command, JsonSerializationHelper.FromFrontendOptions)
        };

        var response = await function.FunctionHandler(request, context);
        var result = response.GetResponseBody<FamilyUnitDto>();

        result.Guests.Should().NotBeNull();
        result.Guests!.Count.Should().BeGreaterThan(0);
        result.Guests![0].FirstName.Should().Be("John");
        }
        catch (Exception ex)
        {
           Assert.Fail(ex.Message);
        }
    }
}
