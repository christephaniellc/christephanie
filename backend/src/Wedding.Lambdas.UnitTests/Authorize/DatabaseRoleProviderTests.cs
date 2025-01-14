using Amazon.SimpleSystemsManagement.Model;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.Lambdas.Authorize.Providers;
using Wedding.Lambdas.UnitTests.TestData;

namespace Wedding.Lambdas.UnitTests.Authorize
{
    [TestFixture]
    [UnitTestsFor(typeof(DatabaseRoleProvider))]
    public class DatabaseRoleProviderTests
    {
        private Mock<ILogger<DatabaseRoleProvider>> _loggerMock;
        private IAuthorizationProvider _databaseRoleProvider;
        private Mock<IDynamoDBProvider> _dynamoProviderMock;
        private Mock<IAuthenticationProvider> _authenticationProviderMock;
        private TestTokenHelper _testTokenHelper;

        [SetUp]
        public void Setup()
        {
            var config = new MapperConfiguration(
                cfg => cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles()));
            var mapper = config.CreateMapper();

            _loggerMock = new Mock<ILogger<DatabaseRoleProvider>>();
            _dynamoProviderMock = new Mock<IDynamoDBProvider>();
            _authenticationProviderMock = new Mock<IAuthenticationProvider>();
            
            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();
            _testTokenHelper = new TestTokenHelper(configuration);

            _databaseRoleProvider =
                new DatabaseRoleProvider(_loggerMock.Object, mapper, _dynamoProviderMock.Object, _authenticationProviderMock.Object);
        }

        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }

        [Test]
        public async Task ShouldNotSaveDuplicateAuth0User()
        {
            // Arrange
            var invitationCode = "ABCDE";
            var guestId = Guid.NewGuid().ToString();
            var existingEmail = "existingemail@gmail.com";
            var testToken = await _testTokenHelper.GenerateAuth0Token(guestId);
            var query = new ValidateAuthQuery(_testTokenHelper.JwtAuthority, _testTokenHelper.JwtAudience, "unittest", testToken.ToString());

            var existingFamily = new WeddingEntity
            {
                InvitationCode = DynamoKeys.GetPartitionKey(invitationCode),
                SortKey = DynamoKeys.GetFamilyInfoSortKey(),
            };
            var existingGuest = new WeddingEntity
            {
                InvitationCode = DynamoKeys.GetPartitionKey(invitationCode),
                SortKey = DynamoKeys.GetGuestSortKey(guestId),
                Auth0Id = "auth0Id-1",
                Email = existingEmail
            };
            var auth0User = new Auth0User
            {
                InvitationCode = invitationCode,
                UserId = "auth0Id-2",
                Email = "otheremail@gmail.com"
            };

            _dynamoProviderMock.Setup(r => r.QueryByGuestIdIndex(guestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<WeddingEntity> { existingGuest });
            _dynamoProviderMock.Setup(r => r.LoadFamilyUnitOnlyAsync(invitationCode, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingFamily);
            _authenticationProviderMock.Setup(a => a.GetUserInfo(query.Token))
                .ReturnsAsync(auth0User);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () => await _databaseRoleProvider.Authorize(query));
            ex.Message.Should().Be($"Invalid operation: Account already created for this guest. Please login with {existingEmail}.");
        }
    }
}
