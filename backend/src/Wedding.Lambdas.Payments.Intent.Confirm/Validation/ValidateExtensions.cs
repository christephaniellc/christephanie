using Wedding.Common.Helpers;
using Wedding.Lambdas.Payments.Intent.Confirm.Commands;

namespace Wedding.Lambdas.Payments.Intent.Confirm.Validation
{
    public static class ValidateExtensions
    {

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetPaymentIntentStatusQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<GetPaymentIntentStatusQuery, GetPaymentIntentStatusQueryValidator>(obj, context);
    }
}
