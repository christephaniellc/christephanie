using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.User.Find.Commands;

namespace Wedding.Lambdas.User.Find.Validation
{
    /// <summary>
    /// Validator for GetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{ GetFamilyUnitQuery }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class FindUserQueryValidator : AbstractValidator<FindUserQuery>, IValidate<FindUserQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="FindUserQueryValidator" /> class.
        /// </summary>
        public FindUserQueryValidator()
        {
            RuleFor(query => query.InvitationCode)
                .SetValidator(new InvitationCodeValidator());
            RuleFor(query => query.FirstName)
                .NotNull()
                .NotEmpty()
                .WithMessage("FirstName cannot be null.");
        }

        public void IsValid(FindUserQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
