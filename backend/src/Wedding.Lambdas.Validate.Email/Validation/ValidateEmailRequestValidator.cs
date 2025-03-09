using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Lambdas.Validate.Email.Commands;
using Wedding.Lambdas.Validate.Email.Requests;

namespace Wedding.Lambdas.Validate.Email.Validation
{
    /// <summary>
    /// Validator for ValidateEmailRequest.
    /// Implements the <see cref="AbstractValidator{ ValidateEmailRequest }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class ValidateEmailRequestValidator : AbstractValidator<ValidateEmailRequest>, IValidate<ValidateEmailRequest>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ValidateEmailCommand" /> class.
        /// </summary>
        public ValidateEmailRequestValidator()
        {
            RuleFor(request => request.Action)
                .NotNull()
                .NotEmpty()
                .WithMessage("Action cannot be empty")
                .IsInEnum()
                .WithMessage("Invalid action.");
        }

        public void IsValid(ValidateEmailRequest obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
