using Wedding.Common.Helpers;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Get.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this AdminGetFamilyUnitQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<AdminGetFamilyUnitQuery, AdminGetFamilyUnitQueryValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this AdminGetFamilyUnitsQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<AdminGetFamilyUnitsQuery, AdminGetFamilyUnitsQueryValidator>(obj, context);
    }
}
