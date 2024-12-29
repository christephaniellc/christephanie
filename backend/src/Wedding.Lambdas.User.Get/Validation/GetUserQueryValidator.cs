using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Lambdas.User.Get.Commands;

namespace Wedding.Lambdas.User.Get.Validation
{
    /// <summary>
    /// Validator for GetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{ GetFamilyUnitQuery }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetUserQueryValidator : AbstractValidator<GetUserQuery>, IValidate<GetUserQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetUserQueryValidator" /> class.
        /// </summary>
        public GetUserQueryValidator()
        {
            RuleFor(query => query.GuestId)
                .NotNull()
                .NotEmpty()
                .WithMessage("UserId cannot be null.");
        }

        public void IsValid(GetUserQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
