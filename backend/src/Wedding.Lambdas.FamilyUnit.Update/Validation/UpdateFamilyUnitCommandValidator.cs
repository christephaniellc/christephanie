using FluentValidation;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Lambdas.FamilyUnit.Update.Commands;

namespace Wedding.Lambdas.FamilyUnit.Update.Validation
{
    /// <summary>
    /// Validator for GetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{ GetFamilyUnitQuery }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class UpdateFamilyUnitCommandValidator : AbstractValidator<UpdateFamilyUnitCommand>, IValidate<UpdateFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateFamilyUnitCommandValidator" /> class.
        /// </summary>
        public UpdateFamilyUnitCommandValidator()
        {
            RuleFor(query => query.FamilyUnit)
                .NotNull()
                .NotEmpty()
                .SetValidator(new UpdateFamilyUnitDtoValidator());
        }

        public void IsValid(UpdateFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
