using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Payments.Intent.Commands;

namespace Wedding.Lambdas.Payments.Intent.Validation
{
    /// <summary>
    /// Validator for AdminGetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetPaymentStatusQueryValidator : AbstractValidator<GetPaymentStatusQuery>, IValidate<GetPaymentStatusQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetPaymentStatusQueryValidator" /> class.
        /// </summary>
        public GetPaymentStatusQueryValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(GetPaymentStatusQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
