using FluentValidation;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation
{
    /// <summary>
    /// Validator for  CreateFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{ CreateFamilyUnitCommand}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class CreateFamilyUnitCommandValidator : AbstractValidator<CreateFamilyUnitCommand>, IValidate<CreateFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreateFamilyUnitCommandValidator" /> class.
        /// </summary>
        public CreateFamilyUnitCommandValidator()
        {
            RuleFor(cmd => cmd.FamilyUnit)
                .NotNull()
                .SetValidator(new CreateFamilyUnitDtoValidator());
        }

        public void IsValid(CreateFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
