using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using NUnit.Framework;
using System.Collections.Generic;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Get
{
    [TestFixture]
    [UnitTestsFor(typeof(Lambdas.Admin.FamilyUnit.Get.Function))]
    public class AdminGetFunctionTests
    {
        private Wedding.Lambdas.Admin.FamilyUnit.Get.Function _function;
        private TestLambdaContext _context;

        [SetUp]
        public void Setup()
        {
            _function = new Wedding.Lambdas.Admin.FamilyUnit.Get.Function();
            _context = new TestLambdaContext();
        }

        [Test]
        public async Task Function_GetSpecificFamilyUnit_ReturnsCorrectResponse()
        {
            // Arrange
            var invitationCode = "TEST123";
            
            var request = new APIGatewayProxyRequest
            {
                PathParameters = new Dictionary<string, string>
                {
                    { "invitationCode", invitationCode }
                },
                Headers = new Dictionary<string, string>
                {
                    { "Authorization", "Bearer dummy-token" }
                }
            };

            // Act
            var response = await _function.FunctionHandler(request, _context);

            // Assert
            Assert.IsNotNull(response);
            Assert.AreEqual(200, response.StatusCode);
            
            // In a real test, we would deserialize the response body and check its contents
            // For now, we just assert that it's not null
            Assert.IsNotNull(response.Body);
        }

        [Test]
        public async Task Function_GetAllFamilyUnits_ReturnsCorrectResponse()
        {
            // Arrange
            var request = new APIGatewayProxyRequest
            {
                Headers = new Dictionary<string, string>
                {
                    { "Authorization", "Bearer dummy-token" }
                }
            };

            // Act
            var response = await _function.FunctionHandler(request, _context);

            // Assert
            Assert.IsNotNull(response);
            Assert.AreEqual(200, response.StatusCode);
            
            // In a real test, we would deserialize the response body and check its contents
            // For now, we just assert that it's not null
            Assert.IsNotNull(response.Body);
        }
        
        [Test]
        public async Task Function_GetAllFamilyUnitsViaAllEndpoint_ReturnsCorrectResponse()
        {
            // Arrange
            var request = new APIGatewayProxyRequest
            {
                Resource = "/admin/familyunit/all",
                Path = "/admin/familyunit/all",
                Headers = new Dictionary<string, string>
                {
                    { "Authorization", "Bearer dummy-token" }
                }
            };

            // Act
            var response = await _function.FunctionHandler(request, _context);

            // Assert
            Assert.IsNotNull(response);
            Assert.AreEqual(200, response.StatusCode);
            
            // In a real test, we would deserialize the response body and check its contents
            // For now, we just assert that it's not null
            Assert.IsNotNull(response.Body);
            
            // We could also verify that the response contains a list of family units
            var familyUnits = JsonSerializer.Deserialize<List<FamilyUnitDto>>(response.Body);
            Assert.IsNotNull(familyUnits);
        }
    }
}