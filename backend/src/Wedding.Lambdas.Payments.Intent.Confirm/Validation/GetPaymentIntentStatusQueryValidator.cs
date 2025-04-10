using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Lambdas.Payments.Intent.Confirm.Commands;

namespace Wedding.Lambdas.Payments.Intent.Confirm.Validation
{
    /// <summary>
    /// Validator for AdminGetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetPaymentIntentStatusQueryValidator : AbstractValidator<GetPaymentIntentStatusQuery>, IValidate<GetPaymentIntentStatusQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetPaymentIntentStatusQueryValidator" /> class.
        /// </summary>
        public GetPaymentIntentStatusQueryValidator()
        {
            RuleFor(cmd => cmd.RequestBodyJson)
                .NotNull()
                .NotEmpty()
                .WithMessage("Request body empty");
            RuleFor(cmd => cmd.SignatureHeader)
                .NotNull()
                .NotEmpty()
                .WithMessage("Signature header empty");
        }

        public void IsValid(GetPaymentIntentStatusQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
