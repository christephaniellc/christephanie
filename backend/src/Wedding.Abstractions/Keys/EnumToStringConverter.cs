namespace Wedding.Abstractions.Keys
{
    using Amazon.DynamoDBv2.DataModel;
    using Amazon.DynamoDBv2.DocumentModel;
    using System;

    public class EnumToStringConverter<TEnum> : IPropertyConverter where TEnum : struct, Enum
    {
        public object FromEntry(DynamoDBEntry entry)
        {
            if (entry == null || string.IsNullOrEmpty(entry.AsString()))
                return default(TEnum);

            if (Enum.TryParse(entry.AsString(), true, out TEnum enumValue))
                return enumValue;

            throw new InvalidOperationException($"Unable to convert '{entry.AsString()}' to enum of type '{typeof(TEnum).Name}'.");
        }

        public DynamoDBEntry ToEntry(object value)
        {
            return value?.ToString();
        }
    }

}
