using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Validate.Phone.Commands;

namespace Wedding.Lambdas.Validate.Phone.Validation
{
    /// <summary>
    /// Validator for RegisterPhoneCommand.
    /// Implements the <see cref="AbstractValidator{ RegisterPhoneCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class RegisterPhoneCommandValidator : AbstractValidator<RegisterPhoneCommand>, IValidate<RegisterPhoneCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterPhoneCommand" /> class.
        /// </summary>
        public RegisterPhoneCommandValidator()
        {
            RuleFor(query => query.PhoneNumber)
                .NotNull()
                .NotEmpty()
                .WithMessage("Phone cannot be empty")
                .SetValidator(new PhoneNumberValidator())
                .WithMessage("Invalid phone number");
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(RegisterPhoneCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
