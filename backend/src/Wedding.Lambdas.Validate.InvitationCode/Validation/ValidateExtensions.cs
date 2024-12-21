using Wedding.Common.Helpers;
using Wedding.Lambdas.Validate.InvitationCode.Commands;

namespace Wedding.Lambdas.Validate.InvitationCode.Validation
{
    public static class ValidateExtensions
    {
        /// <summary>
        /// Validates the specified command.
        /// </summary>
        /// <param name="obj">The command.</param>
        /// <param name="context">The context.</param>
        public static void Validate(
            this GetGuestByInvitationCodeQuery obj,
            object? context = default)
            => ValidateHelpers.Validate<GetGuestByInvitationCodeQuery, GetGuestByInvitationCodeQueryValidator>(obj, context);
    }
}
