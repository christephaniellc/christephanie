using Wedding.Common.Helpers;
using Wedding.Lambdas.Payments.Intent.Commands;

namespace Wedding.Lambdas.Payments.Intent.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this CreatePaymentIntentCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<CreatePaymentIntentCommand, CreatePaymentIntentCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetPaymentStatusQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<GetPaymentStatusQuery, GetPaymentStatusQueryValidator>(obj, context);
    }
}
