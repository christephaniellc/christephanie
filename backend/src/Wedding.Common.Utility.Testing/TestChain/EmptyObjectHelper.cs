namespace Wedding.Common.Utility.Testing.TestChain
{
    public static class EmptyObjectHelper
    {
        public static bool ObjectPropertiesAreNullOrEmpty(object obj)
        {
            var allEmpty = true;
            var properties = obj.GetType().GetProperties();

            foreach (var property in properties)
            {
                var value = property.GetValue(obj);
                allEmpty &= value is null || string.IsNullOrEmpty((string)value);
            }
            return allEmpty;
        }
    }
}
