using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Validate.Email.Commands;

namespace Wedding.Lambdas.Validate.Email.Validation
{
    /// <summary>
    /// Validator for ResendEmailCodeCommand.
    /// Implements the <see cref="AbstractValidator{ ResendCodeCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class ResendEmailCodeCommandValidator : AbstractValidator<ResendEmailCodeCommand>, IValidate<ResendEmailCodeCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ResendEmailCodeCommand" /> class.
        /// </summary>
        public ResendEmailCodeCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(ResendEmailCodeCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
