using Wedding.Common.Helpers;
using Wedding.PublicApi.Logic.Areas.Guest.Commands;

namespace Wedding.PublicApi.Logic.Areas.Guest.Validation
{
    public static class GuestValidateExtensions
    {
        // TODO: SKS
        // /// <summary>
        // /// Validates the specified command.
        // /// </summary>
        // /// <param name="obj">The command.</param>
        // /// <param name="context">The context.</param>
        // public static void Validate(
        //     this CreateGuestCommand obj,
        //     object? context = default)
        //     => ValidateHelpers.Validate<CreateGuestCommand, CreateGuestCommandValidator>(obj, context);
        //
        // /// <summary>
        // /// Validates the specified query.
        // /// </summary>
        // /// <param name="obj">The query.</param>
        // /// <param name="context">The context.</param>
        // public static void Validate(
        //     this GetGuestQuery obj,
        //     object? context = default)
        //     => ValidateHelpers.Validate<GetGuestQuery, GetGuestQueryValidator>(obj, context);
        //
        // /// <summary>
        // /// Validates the specified command.
        // /// </summary>
        // /// <param name="obj">The command.</param>
        // /// <param name="context">The context.</param>
        // public static void Validate(
        //     this UpdateGuestCommand obj,
        //     object? context = default)
        //     => ValidateHelpers.Validate<UpdateGuestCommand, UpdateGuestCommandValidator>(obj, context);
        //
        // /// <summary>
        // /// Validates the specified command.
        // /// </summary>
        // /// <param name="obj">The command.</param>
        // /// <param name="context">The context.</param>
        // public static void Validate(
        //     this DeleteGuestCommand obj,
        //     object? context = default)
        //     => ValidateHelpers.Validate<DeleteGuestCommand, DeleteGuestCommandValidator>(obj, context);

        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this RsvpGuestCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<RsvpGuestCommand, RsvpGuestCommandValidator>(obj, context);
    }
}
