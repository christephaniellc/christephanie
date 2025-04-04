using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Payments.Intent.Commands;

namespace Wedding.Lambdas.Payments.Intent.Validation
{
    /// <summary>
    /// Validator for CreatePaymentIntentCommand.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class CreatePaymentIntentCommandValidator : AbstractValidator<CreatePaymentIntentCommand>, IValidate<CreatePaymentIntentCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreatePaymentIntentCommandValidator" /> class.
        /// </summary>
        public CreatePaymentIntentCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
            RuleFor(cmd => cmd.Amount)
                .NotEmpty()
                .GreaterThan(0)
                .WithMessage("Amount must be greater than 0");
            RuleFor(cmd => cmd.Currency)
                .NotEmpty()
                .WithMessage("Invalid currency");
            RuleFor(cmd => cmd.GuestEmail)
                .NotEmpty()
                .SetValidator(new EmailValidator());
            // RuleFor(cmd => cmd.GiftMetaData)
        }

        public void IsValid(CreatePaymentIntentCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
