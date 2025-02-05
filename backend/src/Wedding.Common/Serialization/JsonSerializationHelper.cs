using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using Wedding.Abstractions.Enums;

namespace Wedding.Common.Serialization
{
    public static class JsonSerializationHelper
    {
        public static readonly JsonSerializerOptions FromFrontendOptions;

        public static readonly JsonSerializerOptions CamelCaseJsonSerializerOptions;

        static JsonSerializationHelper()
        {
            FromFrontendOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters =
                {
                    new CustomEnumConverter<AgeGroupEnum>(),
                    new CustomEnumConverter<InvitationResponseEnum>(),
                    new CustomEnumConverter<NotificationPreferenceEnum>(),
                    new CustomEnumConverter<SleepPreferenceEnum>(),
                    new CustomEnumConverter<FoodPreferenceEnum>(),
                    new CustomEnumConverter<PolicyEffectEnum>(),
                    new CustomEnumConverter<RoleEnum>(),
                    new CustomEnumConverter<RsvpEnum>(),
                    new CustomEnumConverter<RsvpStage>(),
                }
            };
            CamelCaseJsonSerializerOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
                Converters = {
                    new JsonStringEnumConverter()
                }
            };
        }

        public static T DeserializeFromFrontend<T>(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                throw new ArgumentException("Input JSON cannot be null or empty.", nameof(json));
            }

            return JsonSerializer.Deserialize<T>(json, FromFrontendOptions)
                   ?? throw new InvalidOperationException($"Deserialization failed for type {typeof(T).Name}.");
        }
    }

}
