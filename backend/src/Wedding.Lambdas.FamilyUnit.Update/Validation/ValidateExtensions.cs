using Wedding.Common.Helpers;
using Wedding.Lambdas.FamilyUnit.Update.Commands;

namespace Wedding.Lambdas.FamilyUnit.Update.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this UpdateFamilyUnitCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<UpdateFamilyUnitCommand, UpdateFamilyUnitCommandValidator>(obj, context);
    }
}
