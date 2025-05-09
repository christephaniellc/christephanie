using Amazon.DynamoDBv2.DocumentModel;
using FluentAssertions;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Converters
{
    [UnitTestsFor(typeof(EnumToStringConverter<>))]
    [TestFixture]
    public class EnumToStringConverterTests
    {

        [Test]
        public void ToEntry_Should_Serialize_Unannotated_Enum_As_Name()
        {
            var converter = new EnumToStringConverter<RoleEnum>();
            var entry = converter.ToEntry(RoleEnum.Guest);

            entry.Should().BeOfType<Primitive>().Which.AsString().Should().Be("Guest");
        }

        [Test]
        public void FromEntry_Should_Deserialize_Unannotated_Enum_Name()
        {
            var converter = new EnumToStringConverter<RoleEnum>();
            var enumValue = (RoleEnum)converter.FromEntry(new Primitive("Admin"));

            enumValue.Should().Be(RoleEnum.Admin);
        }

        [Test]
        public void ToEntry_Should_Serialize_Annotated_Enum_As_EnumMember_Value()
        {
            var converter = new EnumToStringConverter<CampaignTypeEnum>();
            var entry = converter.ToEntry(CampaignTypeEnum.RsvpNotify);

            entry.Should().BeOfType<Primitive>().Which.AsString().Should().Be("RSVP_NOTIFY");
        }

        [Test]
        public void FromEntry_Should_Deserialize_Annotated_EnumMember_Value()
        {
            var converter = new EnumToStringConverter<CampaignTypeEnum>();
            var enumValue = (CampaignTypeEnum)converter.FromEntry(new Primitive("THANK_YOU"));

            enumValue.Should().Be(CampaignTypeEnum.ThankYou);
        }

        [Test]
        public void FromEntry_Should_Fallback_To_Enum_Name_If_EnumMember_Not_Found()
        {
            var converter = new EnumToStringConverter<CampaignTypeEnum>();
            var enumValue = (CampaignTypeEnum)converter.FromEntry(new Primitive("RsvpNotify"));

            enumValue.Should().Be(CampaignTypeEnum.RsvpNotify);
        }

        [Test]
        public void FromEntry_Should_Throw_On_Invalid_Value()
        {
            var converter = new EnumToStringConverter<CampaignTypeEnum>();
            var action = () => converter.FromEntry(new Primitive("INVALID_VALUE"));

            action.Should().Throw<InvalidOperationException>()
                .WithMessage("*Unable to convert*");
        }

        [Test]
        public void FromEntry_Should_Return_Default_On_Null_Or_Empty_String()
        {
            var converter = new EnumToStringConverter<CampaignTypeEnum>();

            var nullResult = (CampaignTypeEnum)converter.FromEntry(new Primitive((string?)null));
            var emptyResult = (CampaignTypeEnum)converter.FromEntry(new Primitive(""));

            nullResult.Should().Be(default);
            emptyResult.Should().Be(default);
        }

        [Test]
        public void FromString_Should_Behave_Like_FromEntry()
        {
            var converter = new EnumToStringConverter<CampaignTypeEnum>();

            converter.FromString("RSVP_NOTIFY").Should().Be(CampaignTypeEnum.RsvpNotify);
            converter.FromString("ThankYou").Should().Be(CampaignTypeEnum.ThankYou);
            converter.FromString("INVALID").Should().BeNull();
        }
    }
}
