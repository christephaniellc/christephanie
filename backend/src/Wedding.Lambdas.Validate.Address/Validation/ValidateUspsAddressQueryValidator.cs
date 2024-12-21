using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Lambdas.Validate.Address.Commands;

namespace Wedding.Lambdas.Validate.Address.Validation
{
    /// <summary>
    /// Validator for ValidateUspsAddressQuery.
    /// Implements the <see cref="AbstractValidator{ ValidateUspsAddressQuery }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class ValidateUspsAddressQueryValidator : AbstractValidator<ValidateUspsAddressQuery>, IValidate<ValidateUspsAddressQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ValidateUspsAddressQuery" /> class.
        /// </summary>
        public ValidateUspsAddressQueryValidator()
        {
            RuleFor(query => query.EnteredAddress)
                .NotNull()
                .NotEmpty()
                .WithMessage("Address cannot be empty");
            // RuleFor(query => query.EnteredAddress.State)

        }

        public void IsValid(ValidateUspsAddressQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
