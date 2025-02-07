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
    internal class AdminNotifyGuestsCommandValidator : AbstractValidator<AdminNotifyGuestsCommand>, IValidate<AdminNotifyGuestsCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminNotifyGuestsCommandValidator" /> class.
        /// </summary>
        public AdminNotifyGuestsCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
        }

        public void IsValid(AdminNotifyGuestsCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
