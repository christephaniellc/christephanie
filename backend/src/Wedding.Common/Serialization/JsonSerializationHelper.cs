using System;
using System.Text.Json;
using Wedding.Abstractions.Enums;

namespace Wedding.Common.Serialization
{
    public static class JsonSerializationHelper
    {
        public static readonly JsonSerializerOptions Options;

        static JsonSerializationHelper()
        {
            Options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters =
                {
                    new CustomEnumConverter<RoleEnum>(),
                    new CustomEnumConverter<AgeGroupEnum>(),
                    new CustomEnumConverter<InvitationResponseEnum>(),
                    new CustomEnumConverter<MealPreferenceEnum>(),
                    new CustomEnumConverter<RsvpEnum>(),
                    new CustomEnumConverter<RsvpStage>(),
                    new CustomEnumConverter<SleepPreferenceEnum>()
                }
            };
        }

        public static T DeserializeCommand<T>(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                throw new ArgumentException("Input JSON cannot be null or empty.", nameof(json));
            }

            return JsonSerializer.Deserialize<T>(json, Options)
                   ?? throw new InvalidOperationException($"Deserialization failed for type {typeof(T).Name}.");
        }
    }

}
