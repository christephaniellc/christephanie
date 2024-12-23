using Wedding.Common.Helpers;
using Wedding.Lambdas.User.Get.Commands;

namespace Wedding.Lambdas.User.Get.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetUserQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<GetUserQuery, GetUserQueryValidator>(obj, context);
    }
}
