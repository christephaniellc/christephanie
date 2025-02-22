using Wedding.Common.Helpers;
using Wedding.Lambdas.Guest.Patch.Commands;
using Wedding.Lambdas.Guest.Patch.Requests;

namespace Wedding.Lambdas.Guest.Patch.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this PatchGuestCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<PatchGuestCommand, PatchGuestCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this PatchGuestRequest obj,
            object? context = default)
            => ValidateHelpers.Validate<PatchGuestRequest, PatchGuestRequestValidator>(obj, context);
    }
}
