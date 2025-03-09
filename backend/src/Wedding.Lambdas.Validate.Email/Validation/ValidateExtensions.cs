using Wedding.Common.Helpers;
using Wedding.Lambdas.Validate.Email.Commands;
using Wedding.Lambdas.Validate.Email.Requests;

namespace Wedding.Lambdas.Validate.Email.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this ValidateEmailRequest obj,
            object? context = default)
            => ValidateHelpers.Validate<ValidateEmailRequest, ValidateEmailRequestValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this RegisterEmailCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<RegisterEmailCommand, RegisterEmailCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this ResendEmailCodeCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<ResendEmailCodeCommand, ResendEmailCodeCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this ValidateEmailCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<ValidateEmailCommand, ValidateEmailCommandValidator>(obj, context);
    }
}
