using FluentValidation;
using Wedding.Abstractions.Validation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Admin.FamilyUnit.Update.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Update.Validation
{
    /// <summary>
    /// Validator for AdminUpdateFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{AdminUpdateFamilyUnitCommand}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{AdminUpdateFamilyUnitCommand}" />
    internal class AdminUpdateFamilyUnitCommandValidator : AbstractValidator<AdminUpdateFamilyUnitCommand>, IValidate<AdminUpdateFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminUpdateFamilyUnitCommandValidator" /> class.
        /// </summary>
        public AdminUpdateFamilyUnitCommandValidator()
        {
            RuleFor(cmd => cmd.FamilyUnit)
                .NotNull()
                .NotEmpty()
                .SetValidator(new UpdateFamilyUnitDtoValidator());
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
        }

        public void IsValid(AdminUpdateFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
