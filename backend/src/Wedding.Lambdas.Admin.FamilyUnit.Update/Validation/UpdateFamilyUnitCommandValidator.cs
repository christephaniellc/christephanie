using FluentValidation;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Validation
{
    /// <summary>
    /// Validator for UpdateFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{UpdateFamilyUnitCommand}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{UpdateFamilyUnitCommand}" />
    internal class UpdateFamilyUnitCommandValidator : AbstractValidator<UpdateFamilyUnitCommand>, IValidate<UpdateFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateFamilyUnitCommandValidator" /> class.
        /// </summary>
        public UpdateFamilyUnitCommandValidator()
        {
            RuleFor(cmd => cmd.FamilyUnit).SetValidator(new UpdateFamilyUnitDtoValidator());
        }

        public void IsValid(UpdateFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
