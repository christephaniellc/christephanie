using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NSubstitute.Core;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Get.Commands;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Get;

[TestFixture]
[UnitTestsFor(typeof(Lambdas.FamilyUnit.Get.Function))]
public class GetFunctionTests
{
    [Test]
    public async Task TestGetFunction()
    {
        // var function = new Wedding.Lambdas.FamilyUnit.Get.Function();
        // var context = new TestLambdaContext();
        //
        // var guestId = request.GetGuestId();
        // query = new GetFamilyUnitQuery(guestId);
        //
        // // var request = new APIGatewayProxyRequest {
        // //     QueryStringParameters = QueryStringHelper.ConvertToQueryStringParameters(command)
        // // };
        //
        // var response = await function.FunctionHandler(request, context);
        // var result = APIGatewayProxyResponseHelper.GetResponseBody<FamilyUnitDto>(response);
        //
        // result.Guests.Should().NotBeNull();
        // result.Guests!.Count.Should().BeGreaterThan(0);
        // result.Guests![0].FirstName.Should().Be("John");

        Assert.Fail("Test needs update");
    }
}
