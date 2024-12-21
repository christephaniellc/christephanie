namespace Wedding.Abstractions.Validation.Common
{
    public static class ValidationMessages
    {
        public static string MustNotBeNullOrWhitespace(string property)
        {
            return string.Format("{0} cannot be null, empty or consist of only whitespace characters.", property);
        }
    }
}
