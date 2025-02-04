using FluentAssertions;
using FluentValidation.TestHelper;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Validation.Utility
{
    [TestFixture]
    [UnitTestsFor(typeof(TierValidator))]
    public class TierValidatorTests
    {
        private TierValidator _validator;

        [SetUp]
        public void Setup()
        {
            _validator = new TierValidator();
        }

        [TestCase("Platinum+")]
        [TestCase("Platinum")]
        [TestCase("Sapphire")]
        [TestCase("Ruby")]
        [TestCase("Amethyst")]
        [TestCase("Opal")]
        public void ShouldValidateGoodTiers(string tier)
        {
            var result = _validator.TestValidate(tier);
            result.ShouldNotHaveAnyValidationErrors();
        }
    }
}
