using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using System;
using System.Reflection;
using System.Runtime.Serialization;

namespace Wedding.Abstractions.Keys
{
    public class EnumToStringConverter<TEnum> : IPropertyConverter where TEnum : struct, Enum
    {
        public object FromEntry(DynamoDBEntry entry)
        {
            var str = entry.AsString();

            if (string.IsNullOrEmpty(str))
                return default(TEnum);

            // Try to match EnumMember values
            foreach (var field in typeof(TEnum).GetFields(BindingFlags.Public | BindingFlags.Static))
            {
                var attr = field.GetCustomAttribute<EnumMemberAttribute>();
                if (attr?.Value == str)
                    return Enum.Parse(typeof(TEnum), field.Name);
            }

            // Fallback: Try parse normally
            if (Enum.TryParse(str, ignoreCase: true, out TEnum result))
                return result;

            throw new InvalidOperationException($"Unable to convert '{str}' to enum {typeof(TEnum).Name}");
        }

        public DynamoDBEntry ToEntry(object value)
        {
            if (value == null)
                return new Primitive();

            var enumValue = (TEnum)value;
            var field = typeof(TEnum).GetField(enumValue.ToString());
            var attr = field?.GetCustomAttribute<EnumMemberAttribute>();

            var stringValue = attr?.Value ?? enumValue.ToString();

            return new Primitive(stringValue); // ✅ Wrap in Primitive
        }

        public object? FromString(string entry)
        {
            try
            {
                return FromEntry(new Primitive(entry));
            }
            catch
            {
                return null;
            }
        }
    }
}