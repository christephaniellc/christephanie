using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Guest.Patch.Requests;

namespace Wedding.Lambdas.Guest.Patch.Validation
{
    /// <summary>
    /// Validator for PatchGuestCommand.
    /// Implements the <see cref="AbstractValidator{ PatchGuestCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class PatchGuestRequestValidator : AbstractValidator<PatchGuestRequest>, IValidate<PatchGuestRequest>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PatchGuestCommandValidator" /> class.
        /// </summary>
        public PatchGuestRequestValidator()
        {
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
            RuleFor(cmd => cmd.InvitationResponse)
                .IsInEnum()
                .When(cmd => cmd.InvitationResponse != null);
            RuleFor(cmd => cmd.RehearsalDinner)
                .IsInEnum()
                .When(cmd => cmd.RehearsalDinner != null);
            RuleFor(cmd => cmd.FourthOfJuly)
                .IsInEnum()
                .When(cmd => cmd.FourthOfJuly != null);
            RuleFor(cmd => cmd.Wedding)
                .IsInEnum()
                .When(cmd => cmd.Wedding != null);
            RuleForEach(cmd => cmd.NotificationPreference)
                .IsInEnum()
                .When(cmd => cmd.NotificationPreference != null);
            RuleFor(cmd => cmd.SleepPreference)
                .IsInEnum()
                .When(cmd => cmd.SleepPreference != null);
            RuleFor(cmd => cmd.FoodPreference)
                .IsInEnum()
                .When(cmd => cmd.FoodPreference != null);
        }

        public void IsValid(PatchGuestRequest obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
