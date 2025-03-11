using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Validate.Email.Commands;

namespace Wedding.Lambdas.Validate.Email.Validation
{
    /// <summary>
    /// Validator for ValidateEmailCommand.
    /// Implements the <see cref="AbstractValidator{ ValidateEmailCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class ValidateEmailCommandValidator : AbstractValidator<ValidateEmailCommand>, IValidate<ValidateEmailCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ValidateEmailCommand" /> class.
        /// </summary>
        public ValidateEmailCommandValidator()
        {
            RuleFor(query => query.Code)
                .NotNull()
                .NotEmpty()
                .WithMessage("Code cannot be empty")
                .Length(6).WithMessage("Invalid code.")
                .Matches(@"^[0-9]{6}$").WithMessage("Invalid chars code.");
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(ValidateEmailCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
