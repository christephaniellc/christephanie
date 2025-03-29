using FluentValidation;
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
    internal class AdminPatchGuestCommandValidator : AbstractValidator<AdminPatchGuestCommand>, IValidate<AdminPatchGuestCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminUpdateFamilyUnitCommandValidator" /> class.
        /// </summary>
        public AdminPatchGuestCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
            RuleFor(cmd => cmd.GuestId)
                .NotNull()
                .NotEmpty()
                .SetValidator(new GuidValidator());
        }

        public void IsValid(AdminPatchGuestCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
