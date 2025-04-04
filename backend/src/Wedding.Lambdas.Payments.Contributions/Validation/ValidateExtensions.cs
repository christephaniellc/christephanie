using Wedding.Common.Helpers;
using Wedding.Lambdas.Payments.Contributions.Commands;

namespace Wedding.Lambdas.Payments.Contributions.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetContributionsQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<GetContributionsQuery, GetContributionsQueryValidator>(obj, context);
    }
}
