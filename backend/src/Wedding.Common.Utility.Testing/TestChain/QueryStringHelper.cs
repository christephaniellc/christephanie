using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Wedding.Common.Utility.Testing.TestChain
{
    public static class QueryStringHelper
    {
        public static Dictionary<string, string> ConvertToQueryStringParameters<T>(T obj)
        {
            if (obj == null)
            {
                throw new ArgumentNullException(nameof(obj));
            }

            // Serialize the object to JSON
            var json = JsonSerializer.Serialize(obj, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            // Convert the JSON into key-value pairs
            return json
                .TrimStart('{').TrimEnd('}')
                .Split(',')
                .Select(kv => kv.Split(':'))
                .ToDictionary(
                    kv => kv[0].Trim('"'), // Key
                    kv => kv[1].Trim('"')  // Value
                );
        }
    }

}
