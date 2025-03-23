using Wedding.Common.Helpers;
using Wedding.Lambdas.Stats.Get.Commands;

namespace Wedding.Lambdas.Stats.Get.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetStatsQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<GetStatsQuery, GetStatsQueryValidator>(obj, context);
    }
}
