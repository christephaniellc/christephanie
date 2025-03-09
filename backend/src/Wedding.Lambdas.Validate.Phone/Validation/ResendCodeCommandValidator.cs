using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Validate.Phone.Commands;

namespace Wedding.Lambdas.Validate.Phone.Validation
{
    /// <summary>
    /// Validator for ResendCodeCommand.
    /// Implements the <see cref="AbstractValidator{ ResendCodeCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class ResendPhoneCodeCommandValidator : AbstractValidator<ResendPhoneCodeCommand>, IValidate<ResendPhoneCodeCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ResendCodeCommand" /> class.
        /// </summary>
        public ResendPhoneCodeCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(ResendPhoneCodeCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
