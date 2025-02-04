using System;
using System.Collections;

namespace Wedding.Common.Utility.Testing.TestChain
{
    public static class EmptyObjectHelper
    {
        public static bool ObjectPropertiesAreNullOrEmpty(object obj)
        {
            if (obj == null) return true;

            var allEmpty = true;
            var properties = obj.GetType().GetProperties();

            foreach (var property in properties)
            {
                var value = property.GetValue(obj);

                // Check if the value is null
                if (value == null)
                {
                    continue;
                }

                // Handle string properties
                if (value is string strValue && string.IsNullOrEmpty(strValue))
                {
                    continue;
                }

                // Handle collections (Lists, Arrays, etc.)
                if (value is IEnumerable collection && !collection.GetEnumerator().MoveNext())
                {
                    continue;
                }

                // Handle other types (Enums, DateTime, etc.)
                if (property.PropertyType.IsValueType && value.Equals(Activator.CreateInstance(property.PropertyType)))
                {
                    continue;
                }

                // If we reach here, the property is not empty
                allEmpty = false;
                break;
            }

            return allEmpty;
        }
    }
}
