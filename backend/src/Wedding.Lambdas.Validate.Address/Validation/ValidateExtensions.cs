using Wedding.Common.Helpers;
using Wedding.Lambdas.Validate.Address.Commands;

namespace Wedding.Lambdas.Validate.Address.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this ValidateUspsAddressQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<ValidateUspsAddressQuery, ValidateUspsAddressQueryValidator>(obj, context);
    }
}
