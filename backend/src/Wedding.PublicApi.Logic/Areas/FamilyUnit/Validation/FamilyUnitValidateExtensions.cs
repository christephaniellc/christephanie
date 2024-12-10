using Wedding.Common.Helpers;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation
{
    public static class FamilyUnitValidateExtensions
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

        /// <summary>
        /// Validates the specified query.
        /// </summary>
        /// <param name="obj">The query.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetFamilyUnitQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<GetFamilyUnitQuery, GetFamilyUnitQueryValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this UpdateFamilyUnitCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<UpdateFamilyUnitCommand, UpdateFamilyUnitCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this DeleteFamilyUnitCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<DeleteFamilyUnitCommand, DeleteFamilyUnitCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this RsvpFamilyUnitCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<RsvpFamilyUnitCommand, FamilyUnitInvitationResponseCommandValidator>(obj, context);
    }
}
