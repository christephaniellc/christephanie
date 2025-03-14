using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Validate.Phone.Commands;

namespace Wedding.Lambdas.Validate.Phone.Validation
{
    /// <summary>
    /// Validator for ValidatePhoneCommand.
    /// Implements the <see cref="AbstractValidator{ ValidatePhoneCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class ValidatePhoneCommandValidator : AbstractValidator<ValidatePhoneCommand>, IValidate<ValidatePhoneCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ValidatePhoneCommand" /> class.
        /// </summary>
        public ValidatePhoneCommandValidator()
        {
            RuleFor(query => query.Code)
                .NotNull()
                .NotEmpty()
                .WithMessage("Code cannot be empty")
                .Length(6).WithMessage("Invalid code.")
                .Matches(@"^[0-9]{6}$").WithMessage("Invalid code.");
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(ValidatePhoneCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
