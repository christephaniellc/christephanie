using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this AdminUpdateFamilyUnitCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<AdminUpdateFamilyUnitCommand, AdminUpdateFamilyUnitCommandValidator>(obj, context);
    }
}
