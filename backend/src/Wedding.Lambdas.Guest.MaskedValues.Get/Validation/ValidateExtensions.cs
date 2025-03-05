using Wedding.Common.Helpers;
using Wedding.Lambdas.Guest.MaskedValues.Get.Commands;
using Wedding.Lambdas.Guest.MaskedValues.Get.Requests;

namespace Wedding.Lambdas.Guest.MaskedValues.Get.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetMaskedValueCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<GetMaskedValueCommand, GetMaskedValueCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetGuestMaskedValuesRequest obj,
            object? context = default)
            => ValidateHelpers.Validate<GetGuestMaskedValuesRequest, GetGuestMaskedValueRequestValidator>(obj, context);
    }
}
