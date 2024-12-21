using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Delete.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this DeleteFamilyUnitCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<DeleteFamilyUnitCommand, DeleteFamilyUnitCommandValidator>(obj, context);
    }
}
