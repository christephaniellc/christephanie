using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using FluentAssertions;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Serialization;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Update.Commands;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.FamilyUnit.Update
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.FamilyUnit.Update.Function))]
    public class UpdateFunctionTests
    {
        [Test]
        public async Task TestUpdateFunction()
        {
            try
            {
                var dto = JsonSerializer.Deserialize<FamilyUnitDto>(TestDataHelper.REAL_JSON_FAMILY_UNIT, JsonSerializationHelper.FromFrontendOptions);
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

                var function = new Wedding.Lambdas.FamilyUnit.Update.Function();
                var context = new TestLambdaContext();
                //var command = new AdminUpdateFamilyUnitCommand(dto);
                var request = new APIGatewayProxyRequest
                {
                    Body = JsonSerializer.Serialize(dto, JsonSerializationHelper.FromFrontendOptions)
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
}
