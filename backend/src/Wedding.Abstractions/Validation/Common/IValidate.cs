namespace Wedding.Abstractions.Validation.Common
{
    /// <summary>
    /// Interface IValidate
    /// </summary>
    /// <typeparam name="T">The type of objects that this validator can validate.</typeparam>
    public interface IValidate<T>
    {
        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="context">The context.</param>
        void IsValid(T obj, object? context = default);
    }
}
