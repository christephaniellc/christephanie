using Wedding.Common.Helpers;
using Wedding.Lambdas.User.Patch.Commands;

namespace Wedding.Lambdas.User.Patch.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this PatchUserCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<PatchUserCommand, PatchUserCommandValidator>(obj, context);


        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this PatchUserRequest obj,
            object? context = default)
            => ValidateHelpers.Validate<PatchUserRequest, PatchUserRequestValidator>(obj, context);
    }
}
