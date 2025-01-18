using FluentValidation;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Admin.FamilyUnit.Create.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Create.Validation
{
    /// <summary>
    /// Validator for CreateFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class AdminCreateFamilyUnitsCommandValidator : AbstractValidator<AdminCreateFamilyUnitsCommand>, IValidate<AdminCreateFamilyUnitsCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminCreateFamilyUnitsCommandValidator" /> class.
        /// </summary>
        public AdminCreateFamilyUnitsCommandValidator()
        {
            RuleFor(cmd => cmd.FamilyUnits)
                .NotNull()
                .ForEach(familyUnit =>
                {
                    familyUnit
                        .NotNull()
                        .WithMessage("Each FamilyUnit must not be null.")
                        .SetValidator(new CreateFamilyUnitDtoValidator());
                });
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
        }

        public void IsValid(AdminCreateFamilyUnitsCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
