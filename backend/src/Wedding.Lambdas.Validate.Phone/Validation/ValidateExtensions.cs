using Wedding.Common.Helpers;
using Wedding.Lambdas.Validate.Phone.Commands;

namespace Wedding.Lambdas.Validate.Phone.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this RegisterPhoneCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<RegisterPhoneCommand, RegisterPhoneCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this ResendCodeCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<ResendCodeCommand, ResendCodeCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this ValidatePhoneCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<ValidatePhoneCommand, ValidatePhoneCommandValidator>(obj, context);
    }
}
