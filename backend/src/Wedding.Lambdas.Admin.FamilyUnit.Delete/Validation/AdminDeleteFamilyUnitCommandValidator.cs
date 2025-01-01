using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Delete.Validation
{
    /// <summary>
    /// Validator for DeleteFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{DeleteFamilyUnitCommand}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class AdminDeleteFamilyUnitCommandValidator : AbstractValidator<AdminDeleteFamilyUnitCommand>, IValidate<AdminDeleteFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminDeleteFamilyUnitCommandValidator" /> class.
        /// </summary>
        public AdminDeleteFamilyUnitCommandValidator()
        {
            RuleFor(cmd => cmd.InvitationCode)
                .NotNull()
                .SetValidator(new InvitationCodeValidator());
        }

        public void IsValid(AdminDeleteFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
