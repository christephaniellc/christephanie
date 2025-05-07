using Wedding.Common.Helpers;
using Wedding.Lambdas.Notify.Email.Commands;

namespace Wedding.Lambdas.Notify.Email.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this SendRsvpNotificationCommand obj,
            object? context = default)
            => ValidateHelpers.Validate<SendRsvpNotificationCommand, SendRsvpNotificationCommandValidator>(obj, context);
    }
}
