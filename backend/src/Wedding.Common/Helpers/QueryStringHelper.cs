using System;
using System.Linq;
using System.Reflection;

namespace Wedding.Common.Helpers
{
    public static class QueryStringHelper
    {
        public static string ToQueryString<T>(this T address, bool toCamelCase = false)
        {
            var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var queryParams = properties
                .Where(p =>
                    p.GetValue(address, null) != null &&
                    p.GetCustomAttributes(typeof(QueryStringIgnoreAttribute), false).Length == 0)
                .Select(p =>
                {
                    var propertyName = ShouldCamelCase(p.Name, toCamelCase) ? ToCamelCase(p.Name) : p.Name;
                    var propertyValue = p.GetValue(address, null)?.ToString() ?? string.Empty;
                    return $"{Uri.EscapeDataString(propertyName)}={Uri.EscapeDataString(propertyValue)}";
                });
            return string.Join("&", queryParams);
        }

        private static bool ShouldCamelCase(string propertyName, bool useCamelCase)
        {
            // Skip camelCase for certain stupid USPS properties
            return useCamelCase 
                   && propertyName != "ZIPCode"
                   && propertyName != "ZIPPlus4";
        }

        private static string ToCamelCase(string input)
        {
            if (string.IsNullOrEmpty(input) || char.IsLower(input[0]))
            {
                return input;
            }

            return char.ToLowerInvariant(input[0]) + input.Substring(1);
        }
    }
}
