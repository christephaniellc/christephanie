using Wedding.Common.Auth.Commands;
using Wedding.Common.Helpers;

namespace Wedding.Lambdas.Authorize.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this ValidateAuthQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<ValidateAuthQuery, ValidateAuthQueryValidator>(obj, context);
    }
}
