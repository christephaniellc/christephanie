using FluentValidation;
using FluentValidation.Validators;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Guest.Patch.Commands;

namespace Wedding.Lambdas.Guest.Patch.Validation
{
    /// <summary>
    /// Validator for PatchGuestCommand.
    /// Implements the <see cref="AbstractValidator{ PatchGuestCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class PatchGuestCommandValidator : AbstractValidator<PatchGuestCommand>, IValidate<PatchGuestCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PatchGuestCommandValidator" /> class.
        /// </summary>
        public PatchGuestCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
            RuleFor(cmd => cmd.GuestId)
                .NotNull()
                .NotEmpty()
                .SetValidator(new GuidValidator());
            RuleFor(cmd => cmd.AgeGroup)
                .IsInEnum()
                .When(cmd => cmd.AgeGroup != null);
            RuleFor(cmd => cmd.Email)
                .SetValidator(new EmailValidator()!)
                .When(cmd => cmd.Email != null);
            RuleFor(cmd => cmd.Phone)
                .SetValidator(new PhoneNumberValidator()!)
                .When(cmd => cmd.Phone != null);
            // RuleFor(cmd => cmd.Rsvp);
            // RuleFor(cmd => cmd.Preferences);
        }

        public void IsValid(PatchGuestCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
