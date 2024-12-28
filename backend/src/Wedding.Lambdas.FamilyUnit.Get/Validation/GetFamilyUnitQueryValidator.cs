using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.FamilyUnit.Get.Commands;

namespace Wedding.Lambdas.FamilyUnit.Get.Validation
{
    /// <summary>
    /// Validator for GetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{ GetFamilyUnitQuery }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetFamilyUnitQueryValidator : AbstractValidator<GetFamilyUnitQuery>, IValidate<GetFamilyUnitQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetFamilyUnitQueryValidator" /> class.
        /// </summary>
        public GetFamilyUnitQueryValidator()
        {
            RuleFor(query => query.GuestId)
                .NotNull()
                .NotEmpty()
                .SetValidator(new GuidValidator());
        }

        public void IsValid(GetFamilyUnitQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
