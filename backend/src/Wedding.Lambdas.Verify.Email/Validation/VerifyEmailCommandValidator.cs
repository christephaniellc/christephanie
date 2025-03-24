using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Verify.Email.Commands;

namespace Wedding.Lambdas.Verify.Email.Validation
{
    /// <summary>
    /// Validator for VerifyEmailCommand.
    /// Implements the <see cref="AbstractValidator{ VerifyEmailCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class VerifyEmailCommandValidator : AbstractValidator<VerifyEmailCommand>, IValidate<VerifyEmailCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="VerifyEmailCommandValidator" /> class.
        /// </summary>
        public VerifyEmailCommandValidator()
        {
            RuleFor(cmd => cmd.Token)
                .NotNull()
                .NotEmpty()
                .SetValidator(cmd => new JwtTokenValidator(cmd.JwtAuthority, cmd.JwtAudience));
        }

        public void IsValid(VerifyEmailCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
