using Wedding.Common.Helpers;
using Wedding.Lambdas.Verify.Email.Commands;

namespace Wedding.Lambdas.Verify.Email.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this VerifyEmailCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<VerifyEmailCommand, VerifyEmailCommandValidator>(obj, context);
    }
}
