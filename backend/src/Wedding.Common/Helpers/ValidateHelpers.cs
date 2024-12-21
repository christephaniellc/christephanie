using System;
using FluentValidation;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Common.Helpers
{
    /// <summary>
    /// Class Validate - validation generics that work well with IValidate and FluentValidation
    /// </summary>
    public static class ValidateHelpers
    {
        /// <summary>
        /// Validates the specified object using its validator
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="TValidator">The type of the t validator.</typeparam>
        /// <param name="obj">The object.</param>
        /// <param name="context">The context.</param>
        public static void Validate<T, TValidator>(
            T obj,
            object? context = default)
            where TValidator : IValidate<T>, new()
            => new TValidator().IsValid(obj, context);

        /// <summary>
        /// Validates the argument.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="arg">The argument.</param>
        /// <param name="validateArgument">The validate argument.</param>
        /// <param name="argName">Name of the argument.</param>
        /// <param name="context">The context.</param>
        /// <exception cref="ArgumentException">If the passed in argument is invalid according to the rules in its validator.</exception>
        public static void ValidateArgument<T>(
            T arg,
            Action<T, object?> validateArgument,
            string? argName,
            object? context)
        {
            try
            {
                validateArgument(arg, context);
            }
            catch (ValidationException x)
            {
                throw new ArgumentException("Invalid argument. See the inner exception.", argName, x);
            }
        }

        /// <summary>
        /// Validates the argument.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="TValidator">The type of the validator.</typeparam>
        /// <param name="arg">The argument.</param>
        /// <param name="argName">Name of the argument.</param>
        /// <param name="context">The context.</param>
        /// <exception cref="ArgumentException">If the passed in argument is invalid according to the rules in its validator.</exception>
        public static void ValidateArgument<T, TValidator>(
            T arg,
            string? argName,
            object? context)
            where TValidator : IValidate<T>, new()
            => ValidateArgument(arg, Validate<T, TValidator>, argName, context);
    }

}
