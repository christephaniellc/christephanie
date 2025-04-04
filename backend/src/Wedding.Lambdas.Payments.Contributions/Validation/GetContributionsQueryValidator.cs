using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Payments.Contributions.Commands;

namespace Wedding.Lambdas.Payments.Contributions.Validation
{
    /// <summary>
    /// Validator for AdminGetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetContributionsQueryValidator : AbstractValidator<GetContributionsQuery>, IValidate<GetContributionsQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetContributionsQueryValidator" /> class.
        /// </summary>
        public GetContributionsQueryValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(GetContributionsQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
