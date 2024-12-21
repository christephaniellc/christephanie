using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using System;
using System.Collections.Generic;

namespace Wedding.Abstractions.Keys
{
    public class ListEnumToStringConverter<TEnum> : IPropertyConverter where TEnum : struct, Enum
    {
        public object FromEntry(DynamoDBEntry entry)
        {
            if (entry == null || entry is not DynamoDBList dynamoList)
                return new List<TEnum>();

            var result = new List<TEnum>();
            foreach (var item in dynamoList.Entries)
            {
                if (item is Primitive primitive && Enum.TryParse(primitive.AsString(), true, out TEnum value))
                {
                    result.Add(value);
                }
                else
                {
                    throw new InvalidOperationException($"Invalid value '{item}' for enum {typeof(TEnum).Name}");
                }
            }
            return result;
        }

        public DynamoDBEntry ToEntry(object value)
        {
            if (value == null)
                return new DynamoDBList();

            var list = value as List<TEnum>;
            if (list == null)
                throw new InvalidOperationException($"Expected a List<{typeof(TEnum).Name}> but got {value.GetType().Name}");

            var dynamoList = new DynamoDBList();
            foreach (var enumValue in list)
            {
                dynamoList.Add(enumValue.ToString());
            }
            return dynamoList;
        }
    }

}
