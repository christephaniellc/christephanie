using Wedding.Common.Helpers;
using Wedding.Lambdas.FamilyUnit.Patch.Commands;

namespace Wedding.Lambdas.FamilyUnit.Patch.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this PatchFamilyUnitCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<PatchFamilyUnitCommand, PatchFamilyUnitCommandValidator>(obj, context);
    }
}
