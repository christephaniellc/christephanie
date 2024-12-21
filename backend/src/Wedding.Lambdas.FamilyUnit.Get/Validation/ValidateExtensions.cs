using Wedding.Common.Helpers;
using Wedding.Lambdas.FamilyUnit.Get.Commands;

namespace Wedding.Lambdas.FamilyUnit.Get.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetFamilyUnitQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<GetFamilyUnitQuery, GetFamilyUnitQueryValidator>(obj, context);
    }
}
