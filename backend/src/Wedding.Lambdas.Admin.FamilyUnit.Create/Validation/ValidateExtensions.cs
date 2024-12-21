using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this CreateFamilyUnitCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<CreateFamilyUnitCommand, CreateFamilyUnitCommandValidator>(obj, context);
    }
}
