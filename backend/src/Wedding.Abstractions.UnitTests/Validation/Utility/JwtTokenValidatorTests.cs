using FluentValidation.TestHelper;
using Microsoft.Extensions.Configuration;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Configuration;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation.Utility
{
    [TestFixture]
    [UnitTestsFor(typeof(JwtTokenValidator))]
    public class JwtTokenValidatorTests
    {
        private string _jwtAuthority;
        private string _jwtAudience;

        [SetUp]
        public void SetUp()
        {

            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();

            _jwtAuthority = configuration[ConfigurationKeys.AuthenticationAuthority];
            _jwtAudience = configuration[ConfigurationKeys.AuthenticationAudience];
        }

        [Test]
        public void ShouldValidateToken()
        {
            var validator = new JwtTokenValidator(_jwtAuthority, _jwtAudience);
            var result = validator.TestValidate(
                "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlV0UGRsaFRETTE3MlNDUldteS01ZyJ9.eyJodHRwczovL2FwaS5jaHJpc3RlcGhhbmllLmNvbS9ndWVzdF9pZCI6IjhlMjJkYTVlLTI5NDMtNDI5Ny1iYjc4LTFkNjBlODJiYTk0YyIsImlzcyI6Imh0dHBzOi8vY2hyaXN0ZXBoYW5pZS51cy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDcxNjg1ODA0MzY4NTc0NzU4OTciLCJhdWQiOlsiaHR0cHM6Ly9hcGkuY2hyaXN0ZXBoYW5pZS5jb20iLCJodHRwczovL2NocmlzdGVwaGFuaWUudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTczNTcwODYxOCwiZXhwIjoxNzM1Nzk1MDE4LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoic0FKWTFmSWlQd09MYTB6MVNVelhaekQzSHAxdmp1VjUiLCJwZXJtaXNzaW9ucyI6W119.Oss7FK-3uczc-4z5OuAi_QG2H8CGn5iNI46vDt7OoaRpesnIdi_N8IhFPeiNM4mKCrfVZXSpvV4CzYkhTQ-itlNViYyDLkBHrgrbr5qd0fvgf7Q1xdsG4UyTXC2iP7yOninirjQi6pxidz9LJ_uZsJJRHBH8enD6NF9WSp2ddQel5hadOpKL2zcOMvOBC09VR3br8cCTT8rZkglrhXUkNlJak99dsyCA2zF50oj5fDLkZu6FxTUGTN9D5RYGu1X9gwryv6rhAKnQzzkm2eU-gYlBLUd2RJywp2Ho7l0iye5AmD-Bix9IfewMzLYlK-kWoZH07eOvcszNaIUeY197-A");
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
