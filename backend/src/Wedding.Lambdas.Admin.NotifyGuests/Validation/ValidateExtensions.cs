using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.NotifyGuests.Commands;

namespace Wedding.Lambdas.Admin.NotifyGuests.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this AdminNotifyGuestsCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<AdminNotifyGuestsCommand, AdminNotifyGuestsCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this VerifyPhoneNumberCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<VerifyPhoneNumberCommand, VerifyPhoneNumberCommandValidator>(obj, context);
    }
}
