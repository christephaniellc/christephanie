using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Admin.NotifyGuests.Commands;

namespace Wedding.Lambdas.Admin.NotifyGuests.Validation
{
    /// <summary>
    /// Validator for AdminNotifyGuestsCommand.
    /// Implements the <see cref="AbstractValidator{ AdminNotifyGuestsCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class VerifyPhoneNumberCommandValidator : AbstractValidator<VerifyPhoneNumberCommand>, IValidate<VerifyPhoneNumberCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="VerifyPhoneNumberCommand" /> class.
        /// </summary>
        public VerifyPhoneNumberCommandValidator()
        {
            RuleFor(cmd => cmd.PhoneNumber)
                .NotNull()
                .SetValidator(new PhoneNumberValidator());
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
        }

        public void IsValid(VerifyPhoneNumberCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
