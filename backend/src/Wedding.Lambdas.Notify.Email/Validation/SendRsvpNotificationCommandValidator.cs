using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Notify.Email.Commands;

namespace Wedding.Lambdas.Notify.Email.Validation
{
    /// <summary>
    /// Validator for AdminGetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class SendRsvpNotificationCommandValidator : AbstractValidator<SendRsvpNotificationCommand>, IValidate<SendRsvpNotificationCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SendRsvpNotificationCommandValidator" /> class.
        /// </summary>
        public SendRsvpNotificationCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
        }

        public void IsValid(SendRsvpNotificationCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
