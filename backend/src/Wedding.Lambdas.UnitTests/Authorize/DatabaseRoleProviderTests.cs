using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NSubstitute;
using NUnit.Framework;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Auth;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Multitenancy;
using Wedding.Common.Utility.Testing.TestChain;
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
        private Mock<IMultitenancySettingsProvider> _multitenancySettingsProviderMock;
        private TestTokenHelper _testTokenHelper;

        [SetUp]
        public void Setup()
        {
            var config = new MapperConfiguration(cfg =>
                {
                    cfg.AddProfiles(WeddingEntityToDtoMapping.Profiles());
                    cfg.AddProfile<AddressToDtoMapping.AddressToDtoMappingProfile>();
                    cfg.AddProfiles(ViewModelToDtoMapping.Profiles());
                }
            );
            var mapper = config.CreateMapper();

            _loggerMock = new Mock<ILogger<DatabaseRoleProvider>>();
            _dynamoProviderMock = new Mock<IDynamoDBProvider>();
            _authenticationProviderMock = new Mock<IAuthenticationProvider>();
            _multitenancySettingsProviderMock = new Mock<IMultitenancySettingsProvider>();

            var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder()
                .AddJsonFile("appsettings.Development.json")
                .Build();
            _testTokenHelper = new TestTokenHelper(configuration);

            _databaseRoleProvider =
                new DatabaseRoleProvider(_loggerMock.Object, mapper, _dynamoProviderMock.Object, _authenticationProviderMock.Object, _multitenancySettingsProviderMock.Object);
        }

        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }

        [Test]
        public async Task ShouldNotCallAuth0ForInfoWhenUserAlreadyLoggedInBefore()
        {
            // Arrange
            var invitationCode = "ABCDE";
            var guestId = Guid.NewGuid().ToString();
            var existingEmail = new VerifiedDto { Value = "existingemail@gmail.com" };
            var auth0Email = new VerifiedDto { Value = "otheremail@gmail.com" };
            var testToken = await _testTokenHelper!.GenerateAuth0Token(guestId);
            var query = new ValidateAuthQuery(_testTokenHelper.JwtAuthority, _testTokenHelper.JwtAudience, "unittest", "127.0.0.1", testToken.ToString());

            var existingFamily = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(invitationCode),
                InvitationCode = invitationCode,
                SortKey = DynamoKeys.GetFamilyInfoSortKey(),
            };
            var existingGuest = new WeddingEntity
            {
                PartitionKey = DynamoKeys.GetPartitionKey(invitationCode),
                InvitationCode = invitationCode,
                SortKey = DynamoKeys.GetGuestSortKey(guestId),
                Auth0Id = "auth0Id-1",
                Email = existingEmail.ToString()
            };
            var auth0User = new Auth0User
            {
                InvitationCode = invitationCode,
                UserId = "auth0Id-2",
                Email = auth0Email.ToString()
            };

            _dynamoProviderMock!.Setup(r => r.QueryByGuestIdIndex(_testTokenHelper.JwtAudience, guestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<WeddingEntity> { existingGuest });
            _dynamoProviderMock.Setup(r => r.LoadFamilyUnitOnlyAsync(_testTokenHelper.JwtAudience, invitationCode, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingFamily);
            _authenticationProviderMock!.Setup(a => a.GetUserInfo(query.Token!))
                .ReturnsAsync(auth0User);

            // Act & Assert
            var result = await _databaseRoleProvider!.Authorize(query);
            _authenticationProviderMock.Verify(x => x.GetUserInfo(It.IsAny<string>()), Times.Never);

            // var ex = Assert.ThrowsAsync<InvalidOperationException>(async () => await _databaseRoleProvider!.Authorize(query));
            // ex!.Message.Should().Be($"Invalid operation: Account already created for this guest. Please login with {existingEmail}.");
        }
    }
}
