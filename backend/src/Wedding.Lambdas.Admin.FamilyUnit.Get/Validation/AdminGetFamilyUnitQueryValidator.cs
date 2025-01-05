using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Get.Validation
{
    /// <summary>
    /// Validator for AdminGetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class AdminGetFamilyUnitQueryValidator : AbstractValidator<AdminGetFamilyUnitQuery>, IValidate<AdminGetFamilyUnitQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminGetFamilyUnitQueryValidator" /> class.
        /// </summary>
        public AdminGetFamilyUnitQueryValidator()
        {
            RuleFor(cmd => cmd.InvitationCode)
                .NotEmpty()
                .SetValidator(new InvitationCodeValidator());
            RuleFor(cmd => cmd.CurrentUserRoles)
                .NotNull()
                .SetValidator(new AdminValidator());
        }

        public void IsValid(AdminGetFamilyUnitQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
