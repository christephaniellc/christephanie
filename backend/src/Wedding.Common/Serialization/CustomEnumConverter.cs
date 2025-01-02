using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Wedding.Common.Serialization
{
    public class CustomEnumConverter<T> : JsonConverter<T> where T : struct, Enum
    {
        public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.String)
            {
                var enumValue = reader.GetString();
                if (Enum.TryParse(enumValue, true, out T result))
                {
                    return result;
                }
            }
            else if (reader.TokenType == JsonTokenType.Number)
            {
                if (reader.TryGetInt32(out int intValue))
                {
                    if (Enum.IsDefined(typeof(T), intValue))
                    {
                        return (T)Enum.ToObject(typeof(T), intValue);
                    }
                }
            }

            throw new JsonException($"Unable to convert \"{reader.GetString()}\" to enum \"{typeof(T)}\".");
        }

        public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString());
        }
    }
}
