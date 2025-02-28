using Wedding.Abstractions.Dtos;
using Wedding.Common.Helpers;
using Wedding.Common.Utility.Testing.TestChain;

namespace Wedding.Abstractions.UnitTests.Helpers
{
    [UnitTestsFor(typeof(Common.Helpers.QueryStringHelper))]
    [TestFixture]
    public class QueryStringHelperTests
    {
        /// <summary>
        /// Helper method to parse a query string into a dictionary.
        /// This splits the query string on '&' then on '=' (after URL-unescaping).
        /// </summary>
        /// <param name="queryString">The query string to parse.</param>
        /// <returns>A dictionary of key/value pairs.</returns>
        private Dictionary<string, string> ParseQueryString(string queryString)
        {
            return queryString
                .Split(new[] { '&' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(part =>
                {
                    var keyValue = part.Split(new[] { '=' }, 2);
                    var key = Uri.UnescapeDataString(keyValue[0]);
                    var value = keyValue.Length > 1 ? Uri.UnescapeDataString(keyValue[1]) : "";
                    return new { key, value };
                })
                .ToDictionary(x => x.key, x => x.value);
        }

        [Test]
        public void ToQueryString_Excludes_NullProperties_And_UspsVerified()
        {
            // Arrange: create an AddressDto with some null values and a UspsVerified value.
            var address = new AddressDto
            {
                StreetAddress = "5555 5th Ave NE",
                SecondaryAddress = null,  // Should be excluded because it is null.
                City = "Boston",
                State = "MA",
                ZIPCode = "5555",
                UspsVerified = false     // Should be excluded per our filtering logic.
            };

            // Act: generate the query string.
            var queryString = address.ToQueryString();

            // Parse the query string into a dictionary for easy assertions.
            var dict = ParseQueryString(queryString);

            // Assert that non-null properties are present.
            Assert.That(dict.ContainsKey("StreetAddress"), Is.True);
            Assert.That(dict.ContainsKey("City"), Is.True);
            Assert.That(dict.ContainsKey("State"), Is.True);
            Assert.That(dict.ContainsKey("ZIPCode"), Is.True);

            // Assert that the null property is not included.
            Assert.That(dict.ContainsKey("SecondaryAddress"), Is.False, "Null properties should not be included.");

            // Assert that the UspsVerified property is excluded.
            Assert.That(dict.ContainsKey("UspsVerified"), Is.False, "UspsVerified should be excluded from the query string.");
        }

        [Test]
        public void ToQueryString_Converts_ToCamelCase_When_Flag_True()
        {
            // Arrange: create an AddressDto with sample values.
            var address = new AddressDto
            {
                StreetAddress = "123 Main St",
                City = "Springfield",
                State = "IL",
                ZIPCode = "62704",
                UspsVerified = true  // Even if set, it should be ignored.
            };

            // Act: generate the query string with camel-case conversion enabled.
            var queryString = address.ToQueryString(toCamelCase: true);
            var dict = ParseQueryString(queryString);

            // Assert that the keys are in camel case.
            // For example, "StreetAddress" becomes "streetAddress".
            Assert.That(dict.ContainsKey("streetAddress"), Is.True, "Property names should be camel cased.");
            Assert.That(dict.ContainsKey("city"), Is.True, "Property names should be camel cased.");
            Assert.That(dict.ContainsKey("state"), Is.True, "Property names should be camel cased.");
            Assert.That(dict.ContainsKey("ZIPCode"), Is.True, "Property names should be camel cased, except ZIPCode");

            // Verify that UspsVerified is still not included.
            Assert.That(dict.ContainsKey("uspsVerified"), Is.False, "UspsVerified should be excluded even with camel casing.");
        }

        [Test]
        public void ToQueryString_ProperlyUrlEncodesValues()
        {
            // Arrange: create an AddressDto with values that require URL encoding.
            var address = new AddressDto
            {
                StreetAddress = "5555 5th Ave NE",
                City = "New York & Co.",
                State = "NY",
                ZIPCode = "10001"
            };

            // Act: generate the query string.
            var queryString = address.ToQueryString();
            var dict = ParseQueryString(queryString);

            // Assert that the values are correctly decoded from the URL-encoded query string.
            Assert.That(dict["StreetAddress"], Is.EqualTo("5555 5th Ave NE"));
            Assert.That(dict["City"], Is.EqualTo("New York & Co."));
            Assert.That(dict["State"], Is.EqualTo("NY"));
            Assert.That(dict["ZIPCode"], Is.EqualTo("10001"));
        }

        [Test]
        public void ToQueryString_Includes_EmptyStringValues()
        {
            // Arrange: create an AddressDto where a property is an empty string.
            var address = new AddressDto
            {
                StreetAddress = "",
                City = "SomeCity",
                State = "XX",
                ZIPCode = "00000"
            };

            // Act: generate the query string.
            var queryString = address.ToQueryString();
            var dict = ParseQueryString(queryString);

            // Assert that the empty string property is included in the query string.
            Assert.That(dict.ContainsKey("StreetAddress"), Is.True);
            Assert.That(dict["StreetAddress"], Is.EqualTo(""), "Empty string values should be included.");
        }
    }
}
