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
            var converter = new EnumToStringConverter<EmailTypeEnum>();
            var entry = converter.ToEntry(EmailTypeEnum.RsvpNotify);

            entry.Should().BeOfType<Primitive>().Which.AsString().Should().Be("RSVP_NOTIFY");
        }

        [Test]
        public void FromEntry_Should_Deserialize_Annotated_EnumMember_Value()
        {
            var converter = new EnumToStringConverter<EmailTypeEnum>();
            var enumValue = (EmailTypeEnum)converter.FromEntry(new Primitive("THANK_YOU"));

            enumValue.Should().Be(EmailTypeEnum.ThankYou);
        }

        [Test]
        public void FromEntry_Should_Fallback_To_Enum_Name_If_EnumMember_Not_Found()
        {
            var converter = new EnumToStringConverter<EmailTypeEnum>();
            var enumValue = (EmailTypeEnum)converter.FromEntry(new Primitive("RsvpNotify"));

            enumValue.Should().Be(EmailTypeEnum.RsvpNotify);
        }

        [Test]
        public void FromEntry_Should_Throw_On_Invalid_Value()
        {
            var converter = new EnumToStringConverter<EmailTypeEnum>();
            var action = () => converter.FromEntry(new Primitive("INVALID_VALUE"));

            action.Should().Throw<InvalidOperationException>()
                .WithMessage("*Unable to convert*");
        }

        [Test]
        public void FromEntry_Should_Return_Default_On_Null_Or_Empty_String()
        {
            var converter = new EnumToStringConverter<EmailTypeEnum>();

            var nullResult = (EmailTypeEnum)converter.FromEntry(new Primitive((string?)null));
            var emptyResult = (EmailTypeEnum)converter.FromEntry(new Primitive(""));

            nullResult.Should().Be(default);
            emptyResult.Should().Be(default);
        }

        [Test]
        public void FromString_Should_Behave_Like_FromEntry()
        {
            var converter = new EnumToStringConverter<EmailTypeEnum>();

            converter.FromString("RSVP_NOTIFY").Should().Be(EmailTypeEnum.RsvpNotify);
            converter.FromString("ThankYou").Should().Be(EmailTypeEnum.ThankYou);
            converter.FromString("INVALID").Should().BeNull();
        }
    }
}
