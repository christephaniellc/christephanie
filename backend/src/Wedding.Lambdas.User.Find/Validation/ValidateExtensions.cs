using Wedding.Common.Helpers;
using Wedding.Lambdas.User.Find.Commands;

namespace Wedding.Lambdas.User.Find.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this FindUserQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<FindUserQuery, FindUserQueryValidator>(obj, context);
    }
}
