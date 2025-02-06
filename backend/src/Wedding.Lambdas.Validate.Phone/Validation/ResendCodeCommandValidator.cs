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
    internal class ResendCodeCommandValidator : AbstractValidator<ResendCodeCommand>, IValidate<ResendCodeCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ResendCodeCommand" /> class.
        /// </summary>
        public ResendCodeCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(ResendCodeCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
