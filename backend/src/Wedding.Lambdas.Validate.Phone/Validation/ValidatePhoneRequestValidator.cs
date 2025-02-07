using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Lambdas.Validate.Phone.Commands;
using Wedding.Lambdas.Validate.Phone.Requests;

namespace Wedding.Lambdas.Validate.Phone.Validation
{
    /// <summary>
    /// Validator for ValidatePhoneCommand.
    /// Implements the <see cref="AbstractValidator{ ValidatePhoneCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class ValidatePhoneRequestValidator : AbstractValidator<ValidatePhoneRequest>, IValidate<ValidatePhoneRequest>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ValidatePhoneCommand" /> class.
        /// </summary>
        public ValidatePhoneRequestValidator()
        {
            RuleFor(request => request.Action)
                .NotNull()
                .NotEmpty()
                .WithMessage("Action cannot be empty")
                .IsInEnum()
                .WithMessage("Invalid action.");
        }

        public void IsValid(ValidatePhoneRequest obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
