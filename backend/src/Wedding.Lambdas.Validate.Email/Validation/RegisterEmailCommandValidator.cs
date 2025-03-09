using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Validate.Email.Commands;

namespace Wedding.Lambdas.Validate.Email.Validation
{
    /// <summary>
    /// Validator for RegisterPhoneCommand.
    /// Implements the <see cref="AbstractValidator{ RegisterPhoneCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class RegisterEmailCommandValidator : AbstractValidator<RegisterEmailCommand>, IValidate<RegisterEmailCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="RegisterEmailCommand" /> class.
        /// </summary>
        public RegisterEmailCommandValidator()
        {
            RuleFor(query => query.Email)
                .NotNull()
                .NotEmpty()
                .WithMessage("Email cannot be empty")
                .SetValidator(new EmailValidator())
                .WithMessage("Invalid email");
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(RegisterEmailCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
