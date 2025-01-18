using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Configuration;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Abstractions.UnitTests.Validation.Utility
{
    [TestFixture]
    [UnitTestsFor(typeof(JwtTokenValidator))]
    public class JwtTokenValidatorTests
    {
        private TestTokenHelper _testTokenHelper;

        [SetUp]
        public void SetUp()
        {
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _testTokenHelper = new TestTokenHelper(configuration);
        }

        [Test]
        public async Task ShouldValidateToken()
        {
            var validator = new JwtTokenValidator(_testTokenHelper.JwtAuthority, _testTokenHelper.JwtAudience);
            var token = await _testTokenHelper.GenerateAuth0Token(Guid.NewGuid().ToString());
            var result = validator.TestValidate(token.ToString());
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
