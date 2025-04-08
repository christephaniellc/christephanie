using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Payments.Contributions.Handlers;

namespace Wedding.Abstractions.UnitTests.Helpers
{
    [TestFixture]
    [UnitTestsFor(typeof(ContributionPrivacyHelper))]
    public class ContributionPrivacyHelperTests
    {
        [Test]
        public void NonAdmin_Anonymous_ShouldMaskGuestNameAndGuestId()
        {
            var contributions = new List<ContributionDto>
            {
                new ContributionDto
                {
                    GuestName = "Jane Doe",
                    GuestId = "guest_123",
                    IsAnonymous = true
                }
            };

            ContributionPrivacyHelper.ApplyPrivacyMask(contributions, authContextRoles: "User");

            var result = contributions[0];
            Assert.That(result.GuestName, Is.EqualTo("Anonymous"));
            Assert.That(result.GuestId, Is.EqualTo(""));
        }

        [Test]
        public void Admin_Anonymous_ShouldAppendAnonymousToGuestName()
        {
            var contributions = new List<ContributionDto>
            {
                new ContributionDto
                {
                    GuestName = "Jane Doe",
                    GuestId = "guest_123",
                    IsAnonymous = true
                }
            };

            ContributionPrivacyHelper.ApplyPrivacyMask(contributions, authContextRoles: "Admin" );

            var result = contributions[0];
            Assert.That(result.GuestName, Is.EqualTo("Jane Doe (Anonymous)"));
            Assert.That(result.GuestId, Is.EqualTo("guest_123"));
        }

        [Test]
        public void NonAnonymous_ShouldNotChangeGuestNameOrId()
        {
            var contributions = new List<ContributionDto>
            {
                new ContributionDto
                {
                    GuestName = "John Smith",
                    GuestId = "guest_999",
                    IsAnonymous = false
                }
            };

            ContributionPrivacyHelper.ApplyPrivacyMask(contributions, authContextRoles: "Admin");

            var result = contributions[0];
            Assert.That(result.GuestName, Is.EqualTo("John Smith"));
            Assert.That(result.GuestId, Is.EqualTo("guest_999"));
        }

        [Test]
        public void Anonymous_NoRoles_ShouldMask()
        {
            var contributions = new List<ContributionDto>
            {
                new ContributionDto
                {
                    GuestName = "Mystery Person",
                    GuestId = "guest_777",
                    IsAnonymous = true
                }
            };

            ContributionPrivacyHelper.ApplyPrivacyMask(contributions, authContextRoles: null);

            var result = contributions[0];
            Assert.That(result.GuestName, Is.EqualTo("Anonymous"));
            Assert.That(result.GuestId, Is.EqualTo(""));
        }
    }
}

